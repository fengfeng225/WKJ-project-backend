import { ConflictException, NotFoundException, Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Not } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
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

  private logger: Logger = new Logger('ScheduledTask')

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
    return null
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
      query.andWhere('creatorTime between :startTime and :endTime', {startTime, endTime})
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
    checkPlan.lastModifyTime = new Date()
    
    await this.planRepository.save(checkPlan)

    // 开启任务
    const job = this.schedulerRegistry.getCronJob(checkPlan.entityCode)
    job.start()
    job.context.execute = 'manual'
    job.fireOnTick()
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

    // 修改计划为停用
    checkPlan.enabledMark = 0
    checkPlan.nextRunTime = null
    checkPlan.lastModifyTime = new Date()

    // 获取班组
    let classes: BillClass[]

    if (checkPlan.classType === 'classDivide') {
      classes = await this.classRepository
      .createQueryBuilder('class')
      .getMany()
    }

    if (checkPlan.classType === 'categoryDivide') {

    }

    const currentStatusName = checkPlan.entityCode + 'CheckingStatus'
    const historyStatusName = checkPlan.entityCode + 'CheckedStatus'

    // 开启事务
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(CheckPlan, checkPlan)
      
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

      // 更新班组检查状态
      for (const item of classes) {
        // 将班组本期检查状态改为空
        item[currentStatusName] = -1
        // 更新历史检查状态
        const incompleteCheck = await this.recordRepository.find({
          where: {
            checking: 0,
            checkStatus: -1,
            classId: item.id,
            entityCode: checkPlan.entityCode
          }
        })
        if (incompleteCheck.length > 0) item[historyStatusName] = -1
      }

      await transactionalEntityManager.save(BillClass, classes)
    })
    
    return null
  }

  async updateClassCheck(classes: BillClass[], plan: CheckPlan, manager: EntityManager) {
    const currentStatusName = plan.entityCode + 'CheckingStatus'
    const historyStatusName = plan.entityCode + 'CheckedStatus'

    // 添加新一轮记录
    const newRecords: CheckRecord[] = []

    // 遍历班组
    for (const item of classes) {
      // 将班组本期检查状态改为待检查
      item[currentStatusName] = 0
      // 更新历史检查状态
      const incompleteCheck = await this.recordRepository.find({
        where: {
          checking: 0,
          checkStatus: -1,
          classId: item.id,
          entityCode: plan.entityCode
        }
      })
      if (incompleteCheck.length > 0) item[historyStatusName] = -1

      const checkRecord = new CheckRecord()
      checkRecord.fullName = this.getCheckTaskName(plan.cron)
      checkRecord.type = plan.fullName
      checkRecord.entityCode = plan.entityCode
      checkRecord.checkStatus = 0
      checkRecord.checking = 1
      checkRecord.classId = item.id
      newRecords.push(checkRecord)
    }
    
    await manager.save(newRecords)
    await manager.save(classes)
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

  // 初始化定时任务
  // 待优化 1. 修改cron或重启服务，上轮记录的处理 2. 停止任务，上轮记录的处理 3. 开启任务，对停止任务做过处理的记录再处理
  async initScheduledTask() {
    const checkPlan = await this.planRepository.find()

    checkPlan.forEach(plan => {
        // 定义任务
        const job = new CronJob(plan.cron, async () => {
          // 获取最新的plan，可能用户更新过，特别是enableMark
          const newPlan = await this.planRepository.findOne({
            where: {
              id: plan.id
            }
          })

          try {
            // 根据不同分类获取班级
            let classes: BillClass[]
            // 按班级划分
            if (newPlan.classType === 'classDivide') {
              classes = await this.classRepository
              .createQueryBuilder('class')
              .getMany()
            }

            // 按类别划分
            if (newPlan.classType === 'categoryDivide') {

            }

            // 获取进行中的记录, 并结束进行中的检查
            const checkingRecords = await this.recordRepository
            .createQueryBuilder('record')
            .where('checking = 1')
            .andWhere('entityCode = :entityCode', {entityCode: newPlan.entityCode})
            .getMany()
            
            // 多表联动，开启事务
            await this.dataSource.transaction(async (transactionalEntityManager) => {
              if (checkingRecords.length > 0) {
                // 将进行中的checking改为0
                checkingRecords.forEach(record => {
                  if (record.checkStatus === 0) record.checkStatus = -1
                  record.checking = 0
                })
                await transactionalEntityManager.save(CheckRecord, checkingRecords)
              }

              // 更新班组检查状态
              await this.updateClassCheck(classes, newPlan, transactionalEntityManager)

              const job = this.schedulerRegistry.getCronJob(newPlan.entityCode)
               // 改为自动执行标识
              job.context.execute = 'automatic'
              // 更新计划信息 runCount lastRunTime nextRunTime
              newPlan.runCount = newPlan.runCount + 1
              newPlan.nextRunTime = job.nextDate().toJSDate()
              newPlan.lastRunTime = job.lastDate()
              
              await transactionalEntityManager.save(CheckPlan, newPlan)

              // 创建成功日志
              const log = new CheckPlanRunLog()
              log.runResult = 1
              log.description = '下发成功'
              log.checkPlanId = newPlan.id
              await transactionalEntityManager.save(CheckPlanRunLog, log)
            })

            this.logger.log(`下发${newPlan.fullName}检查计划成功`)
          } catch (error) {
             // 创建失败日志
            const log = new CheckPlanRunLog()
            log.runResult = 0
            log.description = error.message
            log.checkPlanId = newPlan.id
            await this.logRepository.save(log)
            this.logger.warn(`下发${newPlan.fullName}检查计划失败`)
          }
        }, null, false, null, {execute: 'automatic'})

        this.schedulerRegistry.addCronJob(plan.entityCode, job)
        if (plan.enabledMark === 1) {
          job.start()
          job.context.execute = 'manual'
          job.fireOnTick()
        }
    })

    this.logger.log(`检查计划任务调度初始化完成`)
  }

  async init() {
    const checkPlan = new CheckPlan()
    checkPlan.fullName = '短期盲板'
    checkPlan.entityCode = 'shortBill'
    checkPlan.classType = 'classDivide'
    checkPlan.cron = '50 * * * * *'
    checkPlan.fullName = '短期盲板'
    await this.planRepository.save(checkPlan)
    return 'done'
  }
}
