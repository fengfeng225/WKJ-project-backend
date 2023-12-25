import { ConflictException, NotFoundException, Injectable, ForbiddenException, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CustomLogger } from 'src/core/logger/custom-logger-service';
import { CronJob, CronTime } from 'cron';
import * as cronParser from 'cron-parser';
import * as moment from 'moment';
import { UpdateCheckPlanDto } from './dto/update-check-plan.dto';
import { CheckPlanRunLog } from './entities/check-plan-run-log.entity';
import { CheckPlan } from './entities/check-plan.entity';
import { CheckRecord } from './entities/check-record.entity';
import { BillClass } from '../bill/class/entities/class.entity';

@Injectable()
export class CheckPlanService {
  constructor(
    @InjectRepository(CheckPlanRunLog)
    private readonly logRepository:Repository<CheckPlanRunLog>,
    @InjectRepository(CheckPlan)
    private readonly planRepository:Repository<CheckPlan>,
    @InjectRepository(CheckRecord)
    private readonly recordRepository:Repository<CheckRecord>,
    @InjectRepository(BillClass)
    private readonly classRepository:Repository<BillClass>,
    private schedulerRegistry: SchedulerRegistry,
    private dataSource: DataSource
  ){}

  private logger: CustomLogger = new CustomLogger('CheckPlan')

  async findAll(keyword: string) {
    const query = this.planRepository.createQueryBuilder('checkPlan').orderBy('sortCode');

    if (keyword) query.where(`fullName LIKE :keyword`, { keyword: `%${keyword}%` })

    const list = await query.getMany()

    return {
      list
    }
  }

  async findOne(id: string) {
    const checkPlan = await this.planRepository.findOne({
      select: {
        id: true,
        fullName: true,
        entityCode: true,
        description: true,
        cron: true,
        stopCron: true,
        sortCode: true
      },
      where: {
        id
      }
    })

    if (!checkPlan) throw new NotFoundException('没有找到检查计划信息')

    return checkPlan
  }

  async update(id: string, updateCheckPlanDto: UpdateCheckPlanDto) {
    const checkPlan = await this.planRepository.findOne({
      where: {
        id
      }
    })

    if (!checkPlan) throw new NotFoundException('没有找到检查计划信息')

    const isExist = await this.planRepository.findOne({
      where: {
        fullName: updateCheckPlanDto.fullName,
        id: Not(updateCheckPlanDto.id)
      }
    })

    if (isExist) throw new ConflictException('名称重复')

    const entity = this.planRepository.create(updateCheckPlanDto) // 转换为实体
    const job = this.schedulerRegistry.getCronJob(checkPlan.entityCode)

    const oldCron = checkPlan.cron // 旧检查周期
    const newCron = entity.cron // 新检查周期
    const oldStopCron = checkPlan.stopCron // 旧截止日期
    const newStopCron = entity.stopCron // 新截止日期

    // 若用户设置的cron无效，退出
    const cronValid = this.getNextTime(newCron)
    if (!cronValid) throw new ForbiddenException('无效的检查周期，请重试！')
    const stopCronValid = this.getNextTime(newStopCron)
    if (!stopCronValid) throw new ForbiddenException('无效的截止日期，请重试！')

    // 分别修改
    if (oldCron !== newCron) { // 只要修改了检查周期，无论是否修改截止日期
      // 更新任务后续的执行日期
      const cronTime = new CronTime(newCron)
      job.setTime(cronTime)

      // 若任务是停止状态，直接保存退出
      if (checkPlan.enabledMark === 0) {
        entity.lastModifyTime = new Date()
        await this.planRepository.save(entity)
        return
      }

      // 若任务是开启状态，更新下次下发日期
      entity.nextRunTime = job.nextDate().toJSDate()

      if (!checkPlan.stopCheckTime || new Date(checkPlan.stopCheckTime).getTime() <= new Date().getTime()) { // 若无截止日期或当前过了截止日期，保存更改，立即执行任务（判断是否在更新后的检查期内）
        entity.lastModifyTime = new Date()
        await this.planRepository.save(entity)
        job.context.execute = 'manual'
        job.fireOnTick()
      } else { // 若有截止日期并且当前没到截止日期
        if (new Date(checkPlan.stopCheckTime).getTime() > entity.nextRunTime.getTime()) {
          // 若下次下发日期早于截止日期，则将截止日期改为下次下发日期，并移除定时器
          entity.stopCheckTime = entity.nextRunTime
          this.removeStopCheckTask(checkPlan.entityCode + 'stopCheck')
        }

        entity.lastModifyTime = new Date()
        await this.planRepository.save(entity)
      }
    }

    if (oldCron === newCron && oldStopCron !== newStopCron) { // 只修改了截止日期
      const now = new Date().getTime()

      if (!checkPlan.stopCheckTime || now > new Date(checkPlan.stopCheckTime).getTime()) { // 无截止日期或有截止日期并且已过，直接保存
        entity.lastModifyTime = new Date()
        await this.planRepository.save(entity)
        // 若无截止日期并且任务是开启状态，立即执行
        if (!checkPlan.stopCheckTime && checkPlan.enabledMark === 1) {
          job.context.execute = 'manual'
          job.fireOnTick()
        }
      }

      if (checkPlan.stopCheckTime && now < new Date(checkPlan.stopCheckTime).getTime()) { // 有截止日期但没过
        const newStopCheckTime = this.getNextTime(newStopCron, new Date(checkPlan.lastRunTime)).getTime() // 新的截止日期
        const maxTime = Math.max(now, newStopCheckTime)
        const newStopTime = Math.min(maxTime, new Date(checkPlan.nextRunTime).getTime())
        entity.stopCheckTime = new Date(newStopTime)
        if (checkPlan.enabledMark === 0) entity.stopRunTime = new Date(newStopTime)
        entity.lastModifyTime = new Date()
        await this.planRepository.save(entity)
        // 保存后再更新定时器执行日期（防止冲突）
        this.addStopCheckTask(checkPlan, new Date(newStopTime))
      }
    }
  }

  async findLogs(id: string, {
    runResult,
    startTime,
    endTime,
    pageSize = 20,
    currentPage = 1
  }): Promise<{ list: CheckPlanRunLog[], pagination: { total: number, pageSize: number, pageIndex: number } }> {
    const query = this.logRepository.createQueryBuilder('log').where('checkPlanId = :id', {id}).orderBy('creatorTime', 'DESC');
    
    if (runResult) {
      query.andWhere('runResult = :runResult', {runResult})
    }

    if (startTime && endTime) {
      query.andWhere('creatorTime between :startTime and :endTime', {startTime: new Date(+startTime), endTime: new Date(+endTime)})
    }

    const total = await query.getCount();
    query.skip((currentPage - 1) * pageSize).take(pageSize);
    const list = await query.getMany();
    const pagination = {
      pageIndex: +currentPage,
      pageSize: +pageSize,
      total
    }

    return { list, pagination }
  }

  async enableCheck(id: string) {
    const checkPlan = await this.planRepository.findOne({
      where: {
        id
      }
    })
    if (!checkPlan) throw new NotFoundException('找不到该检查计划')
    
    checkPlan.enabledMark = 1
    checkPlan.stopRunTime = null
    checkPlan.nextRunTime = this.getNextTime(checkPlan.cron)

    checkPlan.lastModifyTime = new Date()
    await this.planRepository.save(checkPlan)

    // 移除定时器
    this.removeStopCheckTask(checkPlan.entityCode + 'stopCheck')

    // 开启任务并立即执行
    const job = this.schedulerRegistry.getCronJob(checkPlan.entityCode)
    job.start()
    job.context.execute = 'manual'
    job.fireOnTick()
    this.logger.log(`${checkPlan.fullName}定期检查任务已开启`, 'ScheduledTask')
  }

  async stopCheck(id: string) {
    const checkPlan = await this.planRepository.findOne({
      where: {
        id
      }
    })
    if (!checkPlan) throw new NotFoundException('找不到该检查计划')

    // 停止任务
    const job = this.schedulerRegistry.getCronJob(checkPlan.entityCode)
    job.stop()
    this.logger.log(`${checkPlan.fullName}定期检查任务已停止`, 'ScheduledTask')

    // 修改计划为停用
    checkPlan.enabledMark = 0
    checkPlan.nextRunTime = null
    // 若有截止日期并且当前没到截止日期，添加 stopRunTime  以防止服务器重启之后能为进行中的检查添加定时器
    if (checkPlan.stopCheckTime && new Date(checkPlan.stopCheckTime).getTime() > new Date().getTime()) checkPlan.stopRunTime = checkPlan.stopCheckTime

    checkPlan.lastModifyTime = new Date()
    await this.planRepository.save(checkPlan)
  }

  private getCheckTaskName(cron: string) {
    const cycle = this.getCycle(cron)

    const taskTime = new Date()

    const year = taskTime.getFullYear()
    const month = taskTime.getMonth() + 1
    const week = moment(taskTime).week()
    const date = taskTime.getDate()
    switch (cycle) {
      case 'year':
        return year + '年检查'
      case 'month':
        return year + '年' + month + '月检查'
      case 'week':
        return year + '年第' + week + '周检查'
      case 'day':
        return year + '年' + month + '月' + date + '日检查'
      case 'lessThanOneDay':
        return moment(taskTime).format('YYYY-MM-DD HH:mm:ss') + ' 检查'
      default:
        return moment(taskTime).format('YYYY-MM-DD') + '检查'
    }
  }

  private getCycle(cron: string) {
    // 每月18日 0 0 0 18 * *   每年4, 10月  0 0 0 1 4,10 *
    const cronToArray = cron.split(' ')

    if (cronToArray[0].includes('*') || cronToArray[1].includes('*') || cronToArray[2].includes('*')) return 'lessThanOneDay'
    if (cronToArray[3].includes('*') && cronToArray[4].includes('*') && cronToArray[5].includes('*')) return 'day'
    if (cronToArray[3].includes('*') && cronToArray[4].includes('*') && !cronToArray[5].includes('*')) return 'week'
    if (cronToArray[4].includes('*')) return 'month'
    if (!cronToArray[6] || cronToArray[6].includes('*')) return 'year'
    return 'other'
  }

  private getNextTime(cronExpression: string, baseDate: Date = new Date()): Date | null {
    try {
      const interval = cronParser.parseExpression(cronExpression, { currentDate: baseDate });
      const nextTime = interval.next().toDate();
      return nextTime;
    } catch (error) {
      return null;
    }
  }

  private getPrevTime(cronExpression: string): Date | null {
    try {
      const interval = cronParser.parseExpression(cronExpression);
      const prevTime = interval.prev().toDate();
      return prevTime;
    } catch (error) {
      return null;
    }
  }

  private addStopCheckTask(checkPlan: CheckPlan, executeDate: Date) {
    // 避免有重复任务，先删除再添加
    this.removeStopCheckTask(checkPlan.entityCode + 'stopCheck')

    const job = new CronJob(new Date(executeDate), async () => {
      // 获取最新的plan，可能用户更新过
      const newPlan = await this.planRepository.findOne({
        where: {
          id: checkPlan.id
        }
      })

      // 开启事务
      let retries = 3 // 重试次数

      while (retries > 0) {
        try {
          await this.dataSource.transaction(async (transactionalEntityManager) => {      
            // 获取进行中的记录, 并结束进行中的检查
            const records = await this.recordRepository.find({
              where: {
                checking: 1,
                entityCode: newPlan.entityCode
              }
            })
    
            if (records.length > 0) {
              this.finishRecords(records)
              await transactionalEntityManager.save(CheckRecord, records)
            }
    
            // 将plan的stopRunTime清空
            if (newPlan.stopRunTime) {
              newPlan.stopRunTime = null
              await transactionalEntityManager.save(CheckPlan, newPlan)
            }
          })

          this.removeStopCheckTask(newPlan.entityCode + 'stopCheck')
          this.logger.log(`本期${newPlan.fullName}检查已截止`, 'ScheduledTask')

          break; // 成功则立即退出
        } catch (error) {
          retries--

          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000)) // 如果失败，则两秒钟后重试
          } else {
            this.logger.error(`本期${newPlan.fullName}检查截止失败，失败原因: ${error.message}`, 'ScheduledTask')
          }
        }
      }

    })
  
    this.schedulerRegistry.addCronJob(checkPlan.entityCode + 'stopCheck', job)
  }

  private removeStopCheckTask(name: string) {
    const jobs = this.schedulerRegistry.getCronJobs()
    let hasJob = false
    jobs.forEach((value, key) => {
      if (name === key) hasJob = true
    })
    if (hasJob) this.schedulerRegistry.deleteCronJob(name)
  }

  // 结算本轮记录
  private finishRecords(records: CheckRecord[]) {
    records.forEach(record => {
      if (record.checkStatus === 0) record.checkStatus = -1
      record.checking = 0
    })
  }

  // 判断是否在检查期
  private isInInspectionPeriod (checkPlan: CheckPlan) {
    const now = new Date().getTime() // 当前时间
    const prevRunTime = this.getPrevTime(checkPlan.cron).getTime() // cron上次运行时间
    const lastRunTime = checkPlan.lastRunTime ? new Date(checkPlan.lastRunTime).getTime() : 0 // 该检查最后下发时间
    const stopCheckTime = this.getNextTime(checkPlan.stopCron, new Date(prevRunTime)).getTime()// 在cron上次运行时间之后最近的截止时间

    return now < stopCheckTime && prevRunTime > lastRunTime // 在检查期且并非上次检查周期
  }

  // 初始化定时任务
  async initScheduledTask() {
    const checkPlan = await this.planRepository.find()

    checkPlan.forEach(plan => {
        // 定义检查任务
        const job = new CronJob(plan.cron, async () => {
          // 获取最新的plan，可能用户更新过
          const newPlan = await this.planRepository.findOne({
            where: {
              id: plan.id
            }
          })

          // 获取当前任务
          const job = this.schedulerRegistry.getCronJob(newPlan.entityCode)
          const executeType = job.context.execute
          // 改为自动执行标识
          job.context.execute = 'automatic'

          const classes = await this.classRepository
          .createQueryBuilder('class')
          .where('class.parentId IS NOT NULL')
          .getMany()

          // 获取进行中的检查记录
          const checkingRecords = await this.recordRepository
          .createQueryBuilder('record')
          .where('checking = 1')
          .andWhere('entityCode = :entityCode', {entityCode: newPlan.entityCode})
          .getMany()

          if (executeType === 'automatic') { // 自动执行
            // 结束进行中的检查
            this.finishRecords(checkingRecords)
          } else { // 手动执行
            // 获取当前时间戳
            const now = new Date().getTime()

            if (checkingRecords.length > 0) { // 有进行中的检查
              // 获取截止日期和下次下发日期的时间戳
              const stopCheckTime = new Date(newPlan.stopCheckTime).getTime()
              const nextRunTime = new Date(newPlan.nextRunTime).getTime()
              
              if (now < stopCheckTime) { // 若当前在截止日期前
                if (stopCheckTime < nextRunTime) { // 截止日期在下次下发日期前
                  // 添加定时器
                  this.addStopCheckTask(newPlan, newPlan.stopCheckTime)
                } else {
                  // 否则 修改截止日期为下次下发日期
                  newPlan.stopCheckTime = newPlan.nextRunTime
                  await this.planRepository.save(newPlan)
                }
                return
              }

              if (now > stopCheckTime) { // 若当前已过截止日期
                // 结束进行中的检查
                this.finishRecords(checkingRecords)
                // 获取当前是否在检查期
                const inInspectionPeriod = this.isInInspectionPeriod(newPlan)
                // 若在，向后执行；若不在，保存退出
                if (!inInspectionPeriod) {
                  newPlan.nextRunTime = job.nextDate().toJSDate()
                  await this.planRepository.save(newPlan)
                  await this.recordRepository.save(checkingRecords)
                  return
                }
              }
            }

            if (!checkingRecords.length) { // 无进行中的检查
              // 获取当前是否在检查期
              const inInspectionPeriod = this.isInInspectionPeriod(newPlan)
              // 若在，向后执行；若不在，保存退出
              if (!inInspectionPeriod) {
                newPlan.nextRunTime = job.nextDate().toJSDate()
                await this.planRepository.save(newPlan)
                return
              }
            }
          }

          let retries = 3 // 重试次数

          while (retries > 0) {
            try {
              // 多表联动，开启事务
              await this.dataSource.transaction(async (transactionalEntityManager) => {
                if (checkingRecords.length > 0) await transactionalEntityManager.save(CheckRecord, checkingRecords)
  
                // 添加新一轮检查纪录
                const newRecords: CheckRecord[] = []
                for (const item of classes) {
                  const checkRecord = new CheckRecord()
                  checkRecord.fullName = this.getCheckTaskName(newPlan.cron)
                  checkRecord.type = newPlan.fullName
                  checkRecord.entityCode = newPlan.entityCode
                  checkRecord.checkStatus = 0
                  checkRecord.checking = 1
                  checkRecord.classId = item.id
                  newRecords.push(checkRecord)
                }
                
                await transactionalEntityManager.save(newRecords)
  
                // 运行次数+1，更新最后下发日期、截止日期、下次下发日期、添加定时器（设置为截止日期）。
                newPlan.runCount = newPlan.runCount + 1
                newPlan.nextRunTime = job.nextDate().toJSDate()
                newPlan.lastRunTime = job.lastDate() || new Date()
                const stopCheckTime = this.getNextTime(newPlan.stopCron)
                newPlan.stopCheckTime = new Date(Math.min(stopCheckTime.getTime(), newPlan.nextRunTime.getTime())) // 截止日期与下次下发日期的最小值
               
                await transactionalEntityManager.save(CheckPlan, newPlan)
  
                // 创建成功日志
                const log = new CheckPlanRunLog()
                log.runResult = 1
                log.description = '下发成功'
                log.checkPlanId = newPlan.id
                await transactionalEntityManager.save(CheckPlanRunLog, log)
              })
  
              this.logger.log(`下发${newPlan.fullName}${this.getCheckTaskName(newPlan.cron)}计划成功`, 'ScheduledTask')
              break;
            } catch (error) {
              retries--

              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 2000)) // 如果失败，则两秒钟后重试
              } else {
                // 创建失败日志
                const log = new CheckPlanRunLog()
                log.runResult = 0
                log.description = error.message
                log.checkPlanId = newPlan.id
                await this.logRepository.save(log)
                this.logger.error(`下发${newPlan.fullName}${this.getCheckTaskName(newPlan.cron)}计划失败`, 'ScheduledTask')
              }
            }
          }
        }, null, false, null, {execute: 'automatic'})

        this.schedulerRegistry.addCronJob(plan.entityCode, job)

        // 开启状态，直接执行
        if (plan.enabledMark === 1) {
          job.start()
          job.context.execute = 'manual'
          job.fireOnTick()
          this.logger.log(`${plan.fullName}定期检查任务已开启`, 'ScheduledTask')
        }

        // 停用状态，并有stopRunTime，开启定时结束检查任务
        if (plan.enabledMark === 0 && plan.stopRunTime) {
          this.addStopCheckTask(plan, plan.stopRunTime)
        }
    })

    this.logger.log(`检查计划任务调度初始化完成`, 'ScheduledTask')
  }
}
