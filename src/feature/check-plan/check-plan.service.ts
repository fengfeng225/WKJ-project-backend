import { ConflictException, NotFoundException, Injectable, ForbiddenException, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Not } from 'typeorm';
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
        expiringDays: true,
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

    const entity = this.planRepository.create(updateCheckPlanDto)
    entity.lastModifyTime = new Date()

    const job = this.schedulerRegistry.getCronJob(checkPlan.entityCode)

    const oldCron = checkPlan.cron
    const newCron = entity.cron
    if (oldCron !== newCron) { // 修改了cron
      const valid = this.getNextTime(newCron)
      if (!valid) throw new ForbiddenException('无效的cron，请重试！')
      const cronTime = new CronTime(newCron)
      job.setTime(cronTime)
      if (checkPlan.enabledMark === 1) entity.nextRunTime = job.nextDate().toJSDate()
    }

    if (!entity.expiringDays) entity.expiringDays = null

    const oldExpiringDays = checkPlan.expiringDays
    const newExpiringDays = entity.expiringDays
    if (oldExpiringDays !== newExpiringDays && checkPlan.enabledMark === 1) { // 开启的任务修改了有效期
      const timeouts = this.schedulerRegistry.getTimeouts()
      const hasTimeout = timeouts.some(name => name === checkPlan.entityCode)
      // 移除有效期
      if (!newExpiringDays) {
        if (hasTimeout) this.schedulerRegistry.deleteTimeout(checkPlan.entityCode)
        entity.stopCheckTime = null
      }

      // 上次应该执行的标准时间 + 有效期
      const stopCheckTime = this.getPrevTime(checkPlan.cron).getTime() + newExpiringDays * 24 * 60 * 60 * 1000
      const now = new Date().getTime()
      // 新增有效期
      if (!oldExpiringDays) {
        // 比较，如果大于当前时间，则添加停止检查任务；如果小于当前时间，则本轮不做改变
        if (stopCheckTime > now) {
          this.addTimeout(checkPlan, new Date(stopCheckTime))
          entity.stopCheckTime = new Date(stopCheckTime)
        }
      }

      // 改变有效期并有停止检查任务
      if (oldExpiringDays && newExpiringDays && hasTimeout) {
        // 如果新的有效期更长
        if (newExpiringDays > oldExpiringDays) {
          this.schedulerRegistry.deleteTimeout(checkPlan.entityCode)
          this.addTimeout(checkPlan, new Date(stopCheckTime))
          entity.stopCheckTime = new Date(stopCheckTime)
        }
        // 如果新的有效期更短
        if (newExpiringDays < oldExpiringDays) {
          this.schedulerRegistry.deleteTimeout(checkPlan.entityCode)
          this.addTimeout(checkPlan, new Date(stopCheckTime))
          if (stopCheckTime > now) entity.stopCheckTime = new Date(stopCheckTime)
          else entity.stopCheckTime = new Date(now)
        }
      }
    }

    await this.planRepository.save(entity)
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

    // 若没有截止时间，则移除到期处理本轮记录的任务
    const timeouts = this.schedulerRegistry.getTimeouts();
    if (timeouts.some(name => name === checkPlan.entityCode) && !checkPlan.stopCheckTime) {
      this.schedulerRegistry.deleteTimeout(checkPlan.entityCode)
    }
    
    await this.planRepository.save(checkPlan)

    // 开启任务
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
    checkPlan.stopRunTime = checkPlan.stopCheckTime || checkPlan.nextRunTime
    checkPlan.nextRunTime = null
    checkPlan.lastModifyTime = new Date()
    if (!checkPlan.stopCheckTime) {
      // 开启到期处理本轮记录的任务
      this.addTimeout(checkPlan, checkPlan.stopRunTime)
    }

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

  private getNextTime(cronExpression: string): Date | null {
    try {
      const interval = cronParser.parseExpression(cronExpression);
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

  private addTimeout(checkPlan: CheckPlan, stopTime: Date) {
    const callback = async () => {
      // 开启事务
      await this.dataSource.transaction(async (transactionalEntityManager) => {      
        // 获取进行中的记录, 并结束进行中的检查
        const records = await this.recordRepository.find({
          where: {
            checking: 1,
            entityCode: checkPlan.entityCode
          }
        })

        if (records.length > 0) {
          this.finishRecords(records)
          await transactionalEntityManager.save(CheckRecord, records)
        }

        // 将plan的stopRunTime清空
        if (checkPlan.stopRunTime) {
          checkPlan.stopRunTime = null
          await transactionalEntityManager.save(CheckPlan, checkPlan)
        }
      })

      this.schedulerRegistry.deleteTimeout(checkPlan.entityCode);
      this.logger.log(`本期${checkPlan.fullName}检查已截止`, 'ScheduledTask')
    };
  
    const milliseconds = new Date(stopTime).getTime() - new Date().getTime()
    const timeout = setTimeout(callback, milliseconds);
    this.schedulerRegistry.addTimeout(checkPlan.entityCode, timeout);
  }

  // 结算本轮记录
  private finishRecords(records: CheckRecord[]) {
    records.forEach(record => {
      if (record.checkStatus === 0) record.checkStatus = -1
      record.checking = 0
    })
  }

  // 初始化定时任务
  async initScheduledTask() {
    const checkPlan = await this.planRepository.find()

    checkPlan.forEach(plan => {
        // 定义检查任务
        const job = new CronJob(plan.cron, async () => {
          // 获取最新的plan，可能用户更新过，特别是enableMark
          const newPlan = await this.planRepository.findOne({
            where: {
              id: plan.id
            }
          })

          try {
            // 获取当前任务
            const job = this.schedulerRegistry.getCronJob(newPlan.entityCode)
            const executeType = job.context.execute
            // 改为自动执行标识
            job.context.execute = 'automatic'

            const classes = await this.classRepository
            .createQueryBuilder('class')
            .where('class.parentId IS NOT NULL')
            .getMany()

            // 获取进行中的记录
            const checkingRecords = await this.recordRepository
            .createQueryBuilder('record')
            .where('checking = 1')
            .andWhere('entityCode = :entityCode', {entityCode: newPlan.entityCode})
            .getMany()

            // 当前时间戳
            const now = new Date().getTime()

            if (executeType === 'automatic') {
              // 自动执行，结束当前记录
              this.finishRecords(checkingRecords)
            } else {
              // 手动执行
              
              // 无本轮记录的情况
              // 无截止时间，直接添加新纪录
              // 有截止时间但在截止之前(不存在)

              // 有截止时间，并且当前过了截止时间
              if (!checkingRecords.length && newPlan.stopCheckTime && now >= newPlan.stopCheckTime.getTime()) {
                // 判断上次执行是否为本轮周期(只要有截止时间，说明曾经一定下发过任务)
                const prevRunTime = this.getPrevTime(newPlan.cron).getTime() // cron上次标准执行的时间
                const recordCreatorTime = new Date(newPlan.lastRunTime).getTime() // cron上次实际执行的时间
                // 实际在标准之后执行的，则在当前周期内，直接退出，等待下一轮自动执行
                if (recordCreatorTime >= prevRunTime) return
                // 如果超过上一周期，判断当前时间是否在 prevRunTime的有效期之间
                // 在有效期，则去添加新纪录
                // 不在，则直接退出，等待下一轮自动执行
                if (now >= prevRunTime + newPlan.expiringDays * 24 * 60 * 60 * 1000) return
              }

              // 有本轮记录的情况
              // 有截止时间
              if (checkingRecords.length > 0 && newPlan.stopCheckTime) {
                // 添加定时停止检查的任务
                this.addTimeout(newPlan, newPlan.stopCheckTime)
                // 在截止时间之前，直接退出，等待截止
                if (now < newPlan.stopCheckTime.getTime()) return
                // 过了截止时间，结束记录后直接退出
                this.finishRecords(checkingRecords)
                await this.recordRepository.save(checkingRecords)
                return
              }

              // 无截止时间
              if (checkingRecords.length > 0 && !newPlan.stopCheckTime) {
                // 判断记录是否在当前检查周期
                const prevRunTime = this.getPrevTime(newPlan.cron).getTime() // cron上次标准执行的时间
                const recordCreatorTime = new Date(newPlan.lastRunTime).getTime() // cron上次实际执行的时间
                // 实际在标准之后执行的，则在当前周期内，直接退出
                if (recordCreatorTime >= prevRunTime) return
                // 记录已过期，结束记录
                this.finishRecords(checkingRecords)
              }
            }

            
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

              // 更新计划信息 runCount lastRunTime nextRunTime
              newPlan.runCount = newPlan.runCount + 1
              newPlan.nextRunTime = job.nextDate().toJSDate()
              newPlan.lastRunTime = job.lastDate() || new Date()
              if (executeType === 'automatic' && newPlan.expiringDays) {
                // 自动执行，正常更新截止时间，添加停止检查任务
                newPlan.stopCheckTime = new Date(newPlan.lastRunTime.getTime() + newPlan.expiringDays * 24 * 60 * 60 * 1000)
                this.addTimeout(newPlan, newPlan.stopCheckTime)
              }
              if (executeType === 'manual' && newPlan.expiringDays) {
                // 手动执行（可能晚于标准执行时间），计算实际应该截止时间，添加停止检查任务
                newPlan.stopCheckTime = new Date(this.getPrevTime(newPlan.cron).getTime() + newPlan.expiringDays * 24 * 60 * 60 * 1000)
                this.addTimeout(newPlan, newPlan.stopCheckTime)
              }
              
              await transactionalEntityManager.save(CheckPlan, newPlan)

              // 创建成功日志
              const log = new CheckPlanRunLog()
              log.runResult = 1
              log.description = '下发成功'
              log.checkPlanId = newPlan.id
              await transactionalEntityManager.save(CheckPlanRunLog, log)
            })

            this.logger.log(`下发${newPlan.fullName}${this.getCheckTaskName(newPlan.cron)}计划成功`, 'ScheduledTask')
          } catch (error) {
             // 创建失败日志
            const log = new CheckPlanRunLog()
            log.runResult = 0
            log.description = error.message
            log.checkPlanId = newPlan.id
            await this.logRepository.save(log)
            this.logger.error(`下发${newPlan.fullName}${this.getCheckTaskName(newPlan.cron)}计划失败`, 'ScheduledTask')
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
          this.addTimeout(plan, plan.stopRunTime)
        }
    })

    this.logger.log(`检查计划任务调度初始化完成`, 'ScheduledTask')
  }
}
