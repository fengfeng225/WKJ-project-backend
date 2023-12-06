import { ConflictException, NotFoundException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { UpdateCheckPlanDto } from './dto/update-check-plan.dto';
import { CheckPlanRunLog } from './entities/check-plan-run-log.entity';
import { CheckPlan } from './entities/check-plan.entity';
import { CheckRecord } from './entities/check-record.entity';

@Injectable()
export class CheckPlanService {
  constructor(
    @InjectRepository(CheckPlanRunLog)
    private readonly logRepository:Repository<CheckPlanRunLog>,
    @InjectRepository(CheckPlan)
    private readonly planRepository:Repository<CheckPlan>,
    @InjectRepository(CheckRecord)
    private readonly recordRepository:Repository<CheckRecord>
  ){}

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
      where: [
        {fullName: updateCheckPlanDto.fullName, id: Not(updateCheckPlanDto.id)},
        {entityCode: updateCheckPlanDto.entityCode, id: Not(updateCheckPlanDto.id)}
      ]
    })

    if (isExist) throw new ConflictException('名称或编码重复')

    await this.planRepository.save(updateCheckPlanDto)
    return null
  }

  async findLogs(id: string, {
    runResult,
    startTime,
    endTime,
    pageSize = 20,
    currentPage = 1
  }): Promise<{ list: CheckPlanRunLog[], pagination: { total: number, pageSize: number, pageIndex: number } }> {
    const query = this.logRepository.createQueryBuilder('log').where('checkPlanId = :id', {id});

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
    await this.planRepository
    .createQueryBuilder('checkPlan')
    .update()
    .set({enabledMark: 1})
    .where('id = :id', {id})
    .execute()
    return null
  }

  async stopCheck(id: string) {
    await this.planRepository
    .createQueryBuilder('checkPlan')
    .update()
    .set({enabledMark: 0})
    .where('id = :id', {id})
    .execute()
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
    })
    await this.recordRepository.save(checkRecords)
    return null
  }

  async getRecords(id: string) {

  }

  // 更新定时任务 启动、停止、修改周期
  private updateScheduledTask() {}

  // 开启定时任务，main.ts初始化时调用
  private enableScheduledTask() {
    // 检查当前周期是否有记录，没有则立即添加

    // 定时执行，先将当前周期checking改为0，未完成检查status改为-1，添加新一轮记录，添加下发日志，推送首页
  }
}
