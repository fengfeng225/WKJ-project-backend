import { ConflictException, NotFoundException, Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { UpdateCheckPlanDto } from './dto/update-check-plan.dto';
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

    if (runResult !== null) {
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
    
    // 开启任务
    const job = this.schedulerRegistry.getCronJob(checkPlan.entityCode)
    job.start()

    // 是否有停用时的记录
    const records = await this.recordRepository.find({
      where: {
        checking: 2,
        entityCode: checkPlan.entityCode
      }
    })
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

    // 开启事务
    // 将进行中的任务记录checking改为2
    records.forEach(record => record.checking = 2)
    // 将班组本期检查状态改为空

    // 修改计划为停用
    checkPlan.enabledMark = 0
    checkPlan.nextRunTime = null
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

    if (!checkRecords) throw new NotFoundException('没有找到检查项')

    checkRecords.forEach(item => {
      item.inspector = inspector
      item.checkStatus = 1
      item.checkedTime = new Date()
    })
    await this.recordRepository.save(checkRecords)
    return null
  }

  async getRecords(id: string) {
    const list = await this.recordRepository.find({
      where: {
        classId: id,
        checking: 0
      },
      order: {
        creatorTime: 'DESC'
      }
    })

    return {
      list
    }
  }

  async fixRecord(id: string) {
    const record = await this.recordRepository.findOne({
      where: {
        id
      }
    })

    if (!record) throw new NotFoundException('没有找到该记录')
    if (record.checkStatus !== -1) throw new ForbiddenException('禁止修改！')
    record.checkStatus = 2
    await this.recordRepository.save(record)
    return null
  }

  // 更新班组检查状态
  private updateClassCheckStatus() {
    // 停止 将当前周期检查status为0的改为-1
    // 启动 检查当前周期是否有记录，没有则立即添加，有则将未完成的检查status改为0
  }

  // 初始化定时任务
  async initScheduledTask() {
    const checkPlan = await this.planRepository.find()

    checkPlan.forEach(plan => {
        const job = new CronJob(plan.cron, async () => {
          // 任务执行内容
          try {
            // 获取所有班级id
            let classIds: Array<string>
            // 按班级划分
            if (plan.classType === 'classDivide') {
              const classes = await this.classRepository
              .createQueryBuilder('class')
              .select('id')
              .getMany()

              classIds = classes.map(item => item.id)
            }

            // 按类别划分
            if (plan.classType === 'categoryDivide') {

            }

            // 获取上一周期的记录
            const checkingRecords = await this.recordRepository
            .createQueryBuilder('record')
            .where('checking = 1')
            .andWhere('entityCode = :entityCode', {entityCode: plan.entityCode})
            .andWhere('classId IN (:...classIds)', {classIds})
            .getMany()
            
            
            if (checkingRecords.length > 0) {
              // 将上一周期checking改为0
              checkingRecords.forEach(record => {
                if (record.checkStatus === 0) record.checkStatus = -1
                record.checking = 0
              })
            }
    
            // 添加新一轮记录，并下发日志
            const newRecords: CheckRecord[] = []
            classIds.forEach(classId => {
              const checkRecord = new CheckRecord()
              checkRecord.fullName = ''
              checkRecord.entityCode = plan.entityCode
              checkRecord.checkStatus = 0
              checkRecord.checking = 1
              checkRecord.classId = classId
              newRecords.push(checkRecord)
            })

            await this.recordRepository.save(newRecords)
            // 创建成功日志
            const log = new CheckPlanRunLog()
            log.runResult = 1
            log.description = '下发成功'
            log.checkPlanId = plan.id
            await this.logRepository.save(log)

            // 更新计划信息 runCount lastRunTime nextRunTime
            const job = this.schedulerRegistry.getCronJob(plan.entityCode)
            plan.runCount = plan.runCount + 1
            plan.lastRunTime = new Date(job.lastDate())
            plan.nextRunTime = new Date(job.nextDate().toLocaleString())
            await this.planRepository.save(plan)

            this.logger.log(`下发${plan.fullName}检查计划成功`)
          } catch (error) {
             // 创建失败日志
            const log = new CheckPlanRunLog()
            log.runResult = 0
            log.description = error.message
            log.checkPlanId = plan.id
            await this.logRepository.save(log)
          }
        })

        this.schedulerRegistry.addCronJob(plan.entityCode, job)
        if (plan.enabledMark === 1) job.start()
    })
    // const job = new CronJob(`30 * * * * *`, () => {
    //   console.log(123)
    // }, null, false, null, null, true);
    // job.start();
    
    this.logger.log(`检查计划任务调度初始化完成`)
  }
}
