import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePipeCapDto } from './dto/create-pipe-cap.dto';
import { UpdatePipeCapDto } from './dto/update-pipe-cap.dto';
import { PipeCap } from './entities/pipe-cap.entity';
import { BillClass } from '../class/entities/class.entity';

@Injectable()
export class PipeCapService {
  constructor(
    @InjectRepository(PipeCap)
    private readonly pipeCapRepository:Repository<PipeCap>,
    @InjectRepository(BillClass)
    private readonly classRepository:Repository<BillClass>,
  ){}

  async findAllPipeCapBill() {
    const list = await this.pipeCapRepository.find()
    return {
      list
    }
  }

  async findPipeCapBill({
    keyword,
    classId,
    pageSize = 20,
    currentPage = 1,
    queryJson
  }): Promise<{ list: PipeCap[], pagination: { total: number, pageSize: number, pageIndex: number } }>  {
    const query = this.pipeCapRepository.createQueryBuilder('pipeCap');

    if (keyword) {
      query.andWhere(`position LIKE :keyword`, { keyword: `%${keyword}%` });
    }

    if (classId && +classId !== -1) {
      const classes = await this.classRepository
      .createQueryBuilder('class')
      .select('class.id')
      .where('class.id = :classId OR class.parentId = :classId', {classId})
      .getMany()
      const classIds = classes.map(item => item.id)

      query.andWhere(`classId IN (:...classIds)`, { classIds });
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

  async create(createPipeCapDto: CreatePipeCapDto) {
    const entity = this.pipeCapRepository.create(createPipeCapDto)
    await this.pipeCapRepository.save(entity)
  }

  async findOne(id: string) {
    const pipeCap = await this.pipeCapRepository.findOne({
      where: {
        id
      }
    })

    if (!pipeCap) throw new NotFoundException('没有找到管帽信息')

    return pipeCap
  }

  async update(id: string, updatePipeCapDto: UpdatePipeCapDto) {
    const pipeCap = await this.pipeCapRepository.findOne({
      where: {
        id
      }
    })

    if (!pipeCap) throw new NotFoundException('没有找到管帽信息')
    await this.pipeCapRepository.save(updatePipeCapDto)
  }

  async remove(id: string) {
    const pipeCap = await this.pipeCapRepository.findOne({
      where: {
        id
      }
    })

    if (!pipeCap) throw new NotFoundException('没有找到管帽信息')

    await this.pipeCapRepository.softRemove(pipeCap)
  }
}
