import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MbLong } from '../bill/mb/entities/mb-long.entity';
import { MbShort } from '../bill/mb/entities/mb-short.entity';
import { BillClass } from '../bill/class/entities/class.entity';
import { CheckRecord } from '../check-plan/entities/check-record.entity';
import { Container } from '../bill/mutual-channeling-point/container/entities/container.entity';
import { HeatExchanger } from '../bill/mutual-channeling-point/heat-exchanger/entities/heat-exchanger.entity';
import { KeyPoint } from '../bill/mutual-channeling-point/key-point/entities/key-point.entity';
import { OtherPoint } from '../bill/mutual-channeling-point/other-point/entities/other-point.entity';
import { UndergroundSludgeOil } from '../bill/mutual-channeling-point/underground-sludge-oil/entities/underground-sludge-oil.entity';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(BillClass)
    private readonly classRepository:Repository<BillClass>,
    @InjectRepository(CheckRecord)
    private readonly recordRepository:Repository<CheckRecord>,
    @InjectRepository(MbLong)
    private readonly longRepository:Repository<MbLong>,
    @InjectRepository(MbShort)
    private readonly shortRepository:Repository<MbShort>,
    @InjectRepository(Container)
    private readonly containerRepository:Repository<Container>,
    @InjectRepository(HeatExchanger)
    private readonly heatExchangerRepository:Repository<HeatExchanger>,
    @InjectRepository(KeyPoint)
    private readonly keyPointRepository:Repository<KeyPoint>,
    @InjectRepository(OtherPoint)
    private readonly otherPointRepository:Repository<OtherPoint>,
    @InjectRepository(UndergroundSludgeOil)
    private readonly sludgeOilRepository:Repository<UndergroundSludgeOil>
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
    const totalContainer = await this.containerRepository.count()
    const totalHeatExchanger = await this.heatExchangerRepository.count()
    const totalKeyPoint = await this.keyPointRepository.count()
    const totalOtherPoint = await this.otherPointRepository.count()
    const totalSludgeOil = await this.sludgeOilRepository.count()
    
    return {
      totalShort,
      totalLong,
      totalContainer,
      totalHeatExchanger,
      totalKeyPoint,
      totalOtherPoint,
      totalSludgeOil
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
    .orderBy({
      'record.checkStatus': 'ASC',
      'record.creatorTime': 'DESC'
    })
    .getRawMany()

    return {
      list: records
    }
  }
}
