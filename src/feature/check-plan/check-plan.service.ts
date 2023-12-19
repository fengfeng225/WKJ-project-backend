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

    const oldCron = checkPlan.cron
    const newCron = updateCheckPlanDto.cron
    const job = this.schedulerRegistry.getCronJob(checkPlan.entityCode)
    if (oldCron !== newCron) {
      const valid = this.getNextTime(newCron)
      if (!valid) throw new ForbiddenException('无效的cron，请重试！')
      const cronTime = new CronTime(newCron)
      job.setTime(cronTime)
    }

    const entity = this.planRepository.create(updateCheckPlanDto)
    entity.lastModifyTime = new Date()
    if (checkPlan.enabledMark === 1) entity.nextRunTime = job.nextDate().toJSDate()
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
    checkPlan.lastModifyTime = new Date()

    // 移除到期处理本轮记录的任务
    const timeouts = this.schedulerRegistry.getTimeouts();
    if (timeouts.some(name => name === checkPlan.entityCode)) {
      this.schedulerRegistry.deleteTimeout(checkPlan.entityCode);
      this.logger.log(`${checkPlan.fullName}最后一期检查记录定时清算任务已移除`, 'ScheduledTask')
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
    checkPlan.stopRunTime = checkPlan.nextRunTime
    checkPlan.nextRunTime = null
    checkPlan.lastModifyTime = new Date()

    await this.planRepository.save(checkPlan)

    // 开启到期处理本轮记录的任务
    this.addTimeout(checkPlan)
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

  private addTimeout(checkPlan: CheckPlan) {
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

        records.forEach(record => {
          if (record.checkStatus === 0) record.checkStatus = -1
          record.checking = 0
        })
        await transactionalEntityManager.save(CheckRecord, records)

        // 将plan的stopRunTime清空
        checkPlan.stopRunTime = null
        await transactionalEntityManager.save(CheckPlan, checkPlan)
      })

      this.schedulerRegistry.deleteTimeout(checkPlan.entityCode);
      this.logger.log(`${checkPlan.fullName}最后一期检查记录清算完毕，任务已移除`, 'ScheduledTask')
    };
  
    const milliseconds = new Date(checkPlan.stopRunTime).getTime() - new Date().getTime()
    const timeout = setTimeout(callback, milliseconds);
    this.schedulerRegistry.addTimeout(checkPlan.entityCode, timeout);
    this.logger.log(`${checkPlan.fullName}最后一期检查记录定时清算已开启`, 'ScheduledTask')
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

            // 有记录
            if (checkingRecords.length > 0) {
              if (executeType === 'automatic') {  // 若本次任务是自动执行，正常替换
                checkingRecords.forEach(record => {
                  if (record.checkStatus === 0) record.checkStatus = -1
                  record.checking = 0
                })
              } else { // 若是手动执行的，判断记录是否在有效期内
                const prevRunTime = this.getPrevTime(newPlan.cron).getTime()
                const recordCreatorTime = new Date(newPlan.lastRunTime).getTime()
                if (recordCreatorTime >= prevRunTime) return // 有效期内 直接结束
                // 不在有效期 执行正常替换
                checkingRecords.forEach(record => {
                  if (record.checkStatus === 0) record.checkStatus = -1
                  record.checking = 0
                })
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

        if (plan.enabledMark === 1) {
          job.start()
          job.context.execute = 'manual'
          job.fireOnTick()
          this.logger.log(`${plan.fullName}定期检查任务已开启`, 'ScheduledTask')
        }

        // 定义已停止计划的最后一次记录的处理
        if (plan.enabledMark === 0 && plan.stopRunTime) {
          this.addTimeout(plan)
        }
    })

    this.logger.log(`检查计划任务调度初始化完成`, 'ScheduledTask')
  }
}
