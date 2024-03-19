import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
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

    private readonly sludgeOilRepository:Repository<UndergroundSludgeOil>,

    private readonly configService: ConfigService
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
    .addSelect('plan.stopCheckTime', 'stopCheckTime')
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

  async findCheckProgressList() {
    let totalCheck = 0, list = []

    const classList = await this.classRepository
    .createQueryBuilder('class')
    .where('class.parentId IS NOT NULL')
    .getMany()

    if (classList.length) {
      const records = await this.recordRepository
      .createQueryBuilder('record')
      .where('checking = 1')
      .getMany()

      // 这里通过第一个班组的检查记录，获取总检查数量
      const firstClassId = classList[0].id
      totalCheck = records.reduce((total, record) => {
        if(record.classId === firstClassId) return ++total
        return total
      }, 0)
      
      // 获取各班组检查进度
      classList.forEach(item => {
        let checkProgress = {
          className: '',
          progress: 0
        }

        const currentClassRecords = records.filter(record => record.classId === item.id)
        checkProgress.progress = currentClassRecords.reduce((total, record) => {
          if (record.checkStatus === 1) return ++total
          return total
        }, 0)

        checkProgress.className = item.fullName
        list.push(checkProgress)
      })
    }

    return {
      list,
      totalCheck
    }
  }

  async findPDFFiles() {
    let pdfDirectory: string
    if (process.env.NODE_ENV === 'development') pdfDirectory = this.configService.get<string>('pdfPath')
    else pdfDirectory = path.join(__dirname, this.configService.get<string>('pdfPath'))

    return new Promise((resolve, reject) => {
      fs.readdir(pdfDirectory, (err, files) => {
        if (err) {
          reject(err);
        } else {
          const pdfFiles = files
          .filter(file => file.endsWith('.pdf'))
          .map(file => file.replace(/\.pdf$/, ''));
          resolve(pdfFiles);
        }
      });
    });
  }
}
