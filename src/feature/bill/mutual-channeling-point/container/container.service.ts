import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/update-container.dto';
import { Container } from './entities/container.entity';

@Injectable()
export class ContainerService {
  constructor(
    @InjectRepository(Container)
    private readonly containerRepository:Repository<Container>
  ){}

  async findAllContainerBill() {
    const list = await this.containerRepository.find()
    return {
      list
    }
  }

  async findContainerBill({
    keyword,
    classId,
    pageSize = 20,
    currentPage = 1,
    queryJson
  }): Promise<{ list: Container[], pagination: { total: number, pageSize: number, pageIndex: number } }>  {
    const query = this.containerRepository.createQueryBuilder('container');

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

  async create(createContainerDto: CreateContainerDto) {
    const entity = this.containerRepository.create(createContainerDto)
    await this.containerRepository.save(entity)
  }

  async findOne(id: string) {
    const container = await this.containerRepository.findOne({
      where: {
        id
      }
    })

    if (!container) throw new NotFoundException('没有找到容器信息')

    return container
  }

  async update(id: string, updateContainerDto: UpdateContainerDto) {
    const container = await this.containerRepository.findOne({
      where: {
        id
      }
    })

    if (!container) throw new NotFoundException('没有找到容器信息')
    await this.containerRepository.save(updateContainerDto)
  }

  async remove(id: string) {
    const container = await this.containerRepository.findOne({
      where: {
        id
      }
    })

    if (!container) throw new NotFoundException('没有找到容器信息')

    await this.containerRepository.softRemove(container)
  }
}
