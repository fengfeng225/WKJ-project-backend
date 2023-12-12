import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MbLong } from '../bill/mb/entities/mb-long.entity';
import { MbShort } from '../bill/mb/entities/mb-short.entity';
import { BillClass } from '../bill/class/entities/class.entity';
import { CheckRecord } from '../check-plan/entities/check-record.entity';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(MbLong)
    private readonly longRepository:Repository<MbLong>,
    @InjectRepository(MbShort)
    private readonly shortRepository:Repository<MbShort>,
    @InjectRepository(BillClass)
    private readonly classRepository:Repository<BillClass>,
    @InjectRepository(CheckRecord)
    private readonly recordRepository:Repository<CheckRecord>
  ){}

  private async getUserClassList(id: string, account: string): Promise<BillClass[]> {
    if (account === 'admin') {
      return await this.classRepository
      .createQueryBuilder('class')
      .select('class.id')
      .getMany();
    }
    return await this.classRepository
    .createQueryBuilder('class')
    .select('class.id')
    .innerJoin('role_class_relation', 'rcr', 'rcr.billClassId = class.id')
    .innerJoin('user_role_relation', 'urr', 'urr.roleId = rcr.roleId')
    .where('urr.userId = :id', { id })
    .getMany();
  }

  async findSumBills() {
    const totalShort = await this.shortRepository.count()
    const totalLong = await this.longRepository.count()
    
    return {
      totalShort,
      totalLong
    }
  }

  async findNewCheckRecord(id: string, account: string): Promise<{list: CheckRecord[]}> {
    const classList = await this.getUserClassList(id, account)
    const classIds = classList.map(item => item.id)
    const records = await this.recordRepository
    .createQueryBuilder('record')
    .select(['record.id as id', 'record.type as type', 'record.fullName as fullName', 'record.checkStatus as checkStatus', 'record.creatorTime as creatorTime'])
    .leftJoin('bill_class', 'class', 'record.classId = class.id')
    .leftJoin('check_plan', 'plan', 'plan.entityCode = record.entityCode')
    .addSelect('class.fullName', 'className')
    .addSelect('plan.nextRunTime', 'nextRunTime')
    .where('checking = 1')
    .andWhere('classId IN (:...classIds)', {classIds})
    .orderBy('record.creatorTime', 'DESC')
    .getRawMany()

    return {
      list: records
    }
  }
}
