import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOtherPointDto } from './dto/create-other-point.dto';
import { UpdateOtherPointDto } from './dto/update-other-point.dto';
import { OtherPoint } from './entities/other-point.entity';

@Injectable()
export class OtherPointService {
  constructor(
    @InjectRepository(OtherPoint)
    private readonly otherPointRepository:Repository<OtherPoint>
  ){}

  async findAllOtherPointBill() {
    const list = await this.otherPointRepository.find()
    return {
      list
    }
  }

  async findOtherPointBill({
    keyword,
    classId,
    pageSize = 20,
    currentPage = 1,
    queryJson
  }): Promise<{ list: OtherPoint[], pagination: { total: number, pageSize: number, pageIndex: number } }>  {
    const query = this.otherPointRepository.createQueryBuilder('otherPoint');

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

  async create(createOtherPointDto: CreateOtherPointDto) {
    const entity = this.otherPointRepository.create(createOtherPointDto)
    await this.otherPointRepository.save(entity)
  }

  async findOne(id: string) {
    const otherPoint = await this.otherPointRepository.findOne({
      where: {
        id
      }
    })

    if (!otherPoint) throw new NotFoundException('没有找到其他互窜点信息')

    return otherPoint
  }

  async update(id: string, updateOtherPointDto: UpdateOtherPointDto) {
    const otherPoint = await this.otherPointRepository.findOne({
      where: {
        id
      }
    })

    if (!otherPoint) throw new NotFoundException('没有找到其他互窜点信息')
    await this.otherPointRepository.save(updateOtherPointDto)
  }

  async remove(id: string) {
    const otherPoint = await this.otherPointRepository.findOne({
      where: {
        id
      }
    })

    if (!otherPoint) throw new NotFoundException('没有找到其他互窜点信息')

    await this.otherPointRepository.softRemove(otherPoint)
  }
}
