import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateKeyPointDto } from './dto/create-key-point.dto';
import { UpdateKeyPointDto } from './dto/update-key-point.dto';
import { KeyPoint } from './entities/key-point.entity';

@Injectable()
export class KeyPointService {
  constructor(
    @InjectRepository(KeyPoint)
    private readonly keyPointRepository:Repository<KeyPoint>
  ){}

  async findAllKeyPointBill() {
    const list = await this.keyPointRepository.find()
    return {
      list
    }
  }

  async findKeyPointBill({
    keyword,
    classId,
    pageSize = 20,
    currentPage = 1,
    queryJson
  }): Promise<{ list: KeyPoint[], pagination: { total: number, pageSize: number, pageIndex: number } }>  {
    const query = this.keyPointRepository.createQueryBuilder('keyPoint');

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

  async create(createKeyPointDto: CreateKeyPointDto) {
    const entity = this.keyPointRepository.create(createKeyPointDto)
    await this.keyPointRepository.save(entity)
  }

  async findOne(id: string) {
    const keyPoint = await this.keyPointRepository.findOne({
      where: {
        id
      }
    })

    if (!keyPoint) throw new NotFoundException('没有找到关键点信息')

    return keyPoint
  }

  async update(id: string, updateKeyPointDto: UpdateKeyPointDto) {
    const keyPoint = await this.keyPointRepository.findOne({
      where: {
        id
      }
    })

    if (!keyPoint) throw new NotFoundException('没有找到关键点信息')
    await this.keyPointRepository.save(updateKeyPointDto)
  }

  async remove(id: string) {
    const keyPoint = await this.keyPointRepository.findOne({
      where: {
        id
      }
    })

    if (!keyPoint) throw new NotFoundException('没有找到关键点信息')

    await this.keyPointRepository.softRemove(keyPoint)
  }
}
