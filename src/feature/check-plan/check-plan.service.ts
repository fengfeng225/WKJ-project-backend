import { ConflictException, NotFoundException, Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
import cronParser from 'cron-parser';
import { UpdateCheckPlanDto } from './dto/update-check-plan.dto';
import { FixRecordDto } from './dto/fix-record.dto';
import { CheckPlanRunLog } from './entities/check-plan-run-log.entity';
import { CheckPlan } from './entities/check-plan.entity';
import { CheckRecord } from './entities/check-record.entity';
import { MbClass } from '../bill/mb/entities/mb-class.entity';

@Injectable()
export class CheckPlanService {
  constructor(
    @InjectRepository(CheckPlanRunLog)
    private readonly logRepository:Repository<CheckPlanRunLog>,
    @InjectRepository(CheckPlan)
    private readonly planRepository:Repository<CheckPlan>,
    @InjectRepository(CheckRecord)
    private readonly recordRepository:Repository<CheckRecord>,
    @InjectRepository(MbClass)
    private readonly classRepository:Repository<MbClass>,
    private schedulerRegistry: SchedulerRegistry
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
    if (oldCron !== newCron) {
      const job = this.schedulerRegistry.getCronJob(checkPlan.entityCode)
      const cronTime = new CronTime(newCron)
      job.setTime(cronTime)
    }

    const entity = this.planRepository.create(updateCheckPlanDto)
    entity.lastModifyTime = new Date()
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

    // 获取进行中的记录
    const records = await this.recordRepository.find({
      where: {
        checking: 1,
        entityCode: checkPlan.entityCode
      }
    })

    // 结束进行中的检查
    records.forEach(record => {
      if (record.checkStatus === 0) record.checkStatus = -1
      record.checking = 0
    })
    await this.recordRepository.save(records)

    // 更新班组检查状态
    let classes: MbClass[]

    if (checkPlan.classType === 'classDivide') {
      classes = await this.classRepository
      .createQueryBuilder('class')
      .getMany()
    }
    const currentStatusName = checkPlan.entityCode + 'CheckingStatus'
    const historyStatusName = checkPlan.entityCode + 'CheckedStatus'
    classes.forEach(async item => {
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
    })

    await this.classRepository.save(classes)

    // 修改计划为停用
    checkPlan.enabledMark = 0
    checkPlan.nextRunTime = null
    checkPlan.lastModifyTime = new Date()
    await this.planRepository.save(checkPlan)

    return null
  }

  async checkAll({
    classIds,
    inspector,
    type
  }) {
    const checkRecords = await this.recordRepository
    .createQueryBuilder('record')
    .where('checking = 1')
    .andWhere('entityCode = :type', {type})
    .andWhere('classId IN (:...classIds)', {classIds})
    .getMany()

    if (!checkRecords) throw new NotFoundException('没有找到待检查项')

    // 将当前检查记录改为完成状态
    checkRecords.forEach(item => {
      item.inspector = inspector
      item.checkStatus = 1
      item.checkedTime = new Date()
    })
    await this.recordRepository.save(checkRecords)

    // 将对应班组当前检查状态改为完成
    const classes = await this.classRepository
    .createQueryBuilder('class')
    .where('id IN (:...classIds)', {classIds})
    .getMany()
    const currentStatusName = type + 'CheckingStatus'
    classes.forEach(item => item[currentStatusName] = 1)
    await this.classRepository.save(classes)

    return null
  }

  async getRecords(id: string, type: string) {
    const list = await this.recordRepository.find({
      where: {
        classId: id,
        checking: 0,
        entityCode: type
      },
      order: {
        creatorTime: 'DESC'
      }
    })

    return {
      list
    }
  }

  async fixRecord(id: string, fixRecordDto: FixRecordDto) {
    const record = await this.recordRepository.findOne({
      where: {
        id
      }
    })

    if (!record) throw new NotFoundException('没有找到该记录')
    if (record.checkStatus !== -1) throw new ForbiddenException('禁止修改！')

    // 修改历史检查记录
    record.checkStatus = 2
    record.description = fixRecordDto.description
    await this.recordRepository.save(record)
    
    // 更新对应班组历史检查状态
    const incompleteCheck = await this.recordRepository.find({
      where: {
        checking: 0,
        checkStatus: -1,
        classId: record.classId,
        entityCode: record.entityCode
      }
    })
    if (incompleteCheck.length === 0) {
      const currentClass = await this.classRepository.findOne({
        where: {
          id: record.classId
        }
      })
      currentClass[record.entityCode + 'CheckedStatus'] = 1
      await this.classRepository.save(currentClass)
    }

    return null
  }

  async updateClassCheck(classes: MbClass[], entityCode: string) {
    const currentStatusName = entityCode + 'CheckingStatus'
    const historyStatusName = entityCode + 'CheckedStatus'

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
          entityCode
        }
      })
      if (incompleteCheck.length > 0) item[historyStatusName] = -1

      const checkRecord = new CheckRecord()
      checkRecord.fullName = '123'
      checkRecord.entityCode = entityCode
      checkRecord.checkStatus = 0
      checkRecord.checking = 1
      checkRecord.classId = item.id
      newRecords.push(checkRecord)
    }
    
    await this.recordRepository.save(newRecords)
    await this.classRepository.save(classes)
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
  async initScheduledTask() {
    const checkPlan = await this.planRepository.find()

    checkPlan.forEach(plan => {
        const job = new CronJob(plan.cron, async () => {
          const newPlan = await this.planRepository.findOne({
            where: {
              id: plan.id
            }
          })
          // 任务执行内容
          try {
            // 获取所有班级id
            let classes: MbClass[]
            // 按班级划分
            if (newPlan.classType === 'classDivide') {
              classes = await this.classRepository
              .createQueryBuilder('class')
              .getMany()
            }

            // 按类别划分
            if (newPlan.classType === 'categoryDivide') {

            }

            // 获取进行中的记录
            const checkingRecords = await this.recordRepository
            .createQueryBuilder('record')
            .where('checking = 1')
            .andWhere('entityCode = :entityCode', {entityCode: newPlan.entityCode})
            .getMany()
            
            
            if (checkingRecords.length > 0) {
              // 将进行中的checking改为0
              checkingRecords.forEach(record => {
                if (record.checkStatus === 0) record.checkStatus = -1
                record.checking = 0
              })
              await this.recordRepository.save(checkingRecords)
            }

            // 更新班组检查状态
            await this.updateClassCheck(classes, newPlan.entityCode)

            // 更新计划信息 runCount lastRunTime nextRunTime
            const job = this.schedulerRegistry.getCronJob(newPlan.entityCode)
            newPlan.runCount = newPlan.runCount + 1
            newPlan.nextRunTime = job.nextDate().toJSDate()
            const lastRunTime = job.lastDate()
            if (lastRunTime) newPlan.lastRunTime = lastRunTime
            
            await this.planRepository.save(newPlan)

            // 创建成功日志
            const log = new CheckPlanRunLog()
            log.runResult = 1
            log.description = '下发成功'
            log.checkPlanId = newPlan.id
            await this.logRepository.save(log)

            this.logger.log(`下发${newPlan.fullName}检查计划成功`)
          } catch (error) {
             // 创建失败日志
            const log = new CheckPlanRunLog()
            log.runResult = 0
            log.description = error.message
            log.checkPlanId = newPlan.id
            await this.logRepository.save(log)
          }
        })

        this.schedulerRegistry.addCronJob(plan.entityCode, job)
        if (plan.enabledMark === 1) {
          job.start()
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
