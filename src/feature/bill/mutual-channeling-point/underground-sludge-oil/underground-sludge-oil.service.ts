import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUndergroundSludgeOilDto } from './dto/create-underground-sludge-oil.dto';
import { UpdateUndergroundSludgeOilDto } from './dto/update-underground-sludge-oil.dto';
import { UndergroundSludgeOil } from './entities/underground-sludge-oil.entity';

@Injectable()
export class UndergroundSludgeOilService {
  constructor(
    @InjectRepository(UndergroundSludgeOil)
    private readonly sludgeOilRepository:Repository<UndergroundSludgeOil>
  ){}

  async findAllUndergroundSludgeOilBill() {
    const list = await this.sludgeOilRepository.find()
    return {
      list
    }
  }

  async findUndergroundSludgeOilBill({
    keyword,
    classId,
    pageSize = 20,
    currentPage = 1,
    queryJson
  }): Promise<{ list: UndergroundSludgeOil[], pagination: { total: number, pageSize: number, pageIndex: number } }>  {
    const query = this.sludgeOilRepository.createQueryBuilder('sludgeOil');

    if (keyword) {
      query.andWhere(`position LIKE :keyword`, { keyword: `%${keyword}%` });
    }

    if (classId && +classId !== -1) {
      query.andWhere(`classId = :classId`, {classId});
    }

    if (queryJson) {
      query.andWhere(`name IN (:...devices)`, { devices: JSON.parse(queryJson) });
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

  async create(createUndergroundSludgeOilDto: CreateUndergroundSludgeOilDto) {
    const entity = this.sludgeOilRepository.create(createUndergroundSludgeOilDto)
    await this.sludgeOilRepository.save(entity)
  }

  async findOne(id: string) {
    const sludgeOil = await this.sludgeOilRepository.findOne({
      where: {
        id
      }
    })

    if (!sludgeOil) throw new NotFoundException('没有找到地下污油信息')

    return sludgeOil
  }

  async update(id: string, updateUndergroundSludgeOilDto: UpdateUndergroundSludgeOilDto) {
    const sludgeOil = await this.sludgeOilRepository.findOne({
      where: {
        id
      }
    })

    if (!sludgeOil) throw new NotFoundException('没有找到地下污油信息')
    await this.sludgeOilRepository.save(updateUndergroundSludgeOilDto)
  }

  async remove(id: string) {
    const sludgeOil = await this.sludgeOilRepository.findOne({
      where: {
        id
      }
    })

    if (!sludgeOil) throw new NotFoundException('没有找到地下污油信息')

    await this.sludgeOilRepository.softRemove(sludgeOil)
  }
}
