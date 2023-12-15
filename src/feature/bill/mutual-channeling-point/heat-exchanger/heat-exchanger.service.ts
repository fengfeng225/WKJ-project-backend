import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHeatExchangerDto } from './dto/create-heat-exchanger.dto';
import { UpdateHeatExchangerDto } from './dto/update-heat-exchanger.dto';
import { HeatExchanger } from './entities/heat-exchanger.entity';

@Injectable()
export class HeatExchangerService {
  constructor(
    @InjectRepository(HeatExchanger)
    private readonly heatExchangerRepository:Repository<HeatExchanger>
  ){}

  async findAllHeatExchangerBill() {
    const list = await this.heatExchangerRepository.find()
    return {
      list
    }
  }

  async findHeatExchangerBill({
    keyword,
    classId,
    pageSize = 20,
    currentPage = 1,
    queryJson
  }): Promise<{ list: HeatExchanger[], pagination: { total: number, pageSize: number, pageIndex: number } }>  {
    const query = this.heatExchangerRepository.createQueryBuilder('heatExchanger');

    if (keyword) {
      query.andWhere(`equipmentName LIKE :keyword OR equipmentTag LIKE :keyword`, { keyword: `%${keyword}%` });
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

  async create(createHeatExchangerDto: CreateHeatExchangerDto) {
    const entity = this.heatExchangerRepository.create(createHeatExchangerDto)
    await this.heatExchangerRepository.save(entity)
  }

  async findOne(id: string) {
    const heatExchanger = await this.heatExchangerRepository.findOne({
      where: {
        id
      }
    })

    if (!heatExchanger) throw new NotFoundException('没有找到换热器信息')

    return heatExchanger
  }

  async update(id: string, updateHeatExchangerDto: UpdateHeatExchangerDto) {
    const heatExchanger = await this.heatExchangerRepository.findOne({
      where: {
        id
      }
    })

    if (!heatExchanger) throw new NotFoundException('没有找到换热器信息')
    await this.heatExchangerRepository.save(updateHeatExchangerDto)
  }

  async remove(id: string) {
    const heatExchanger = await this.heatExchangerRepository.findOne({
      where: {
        id
      }
    })

    if (!heatExchanger) throw new NotFoundException('没有找到换热器信息')

    await this.heatExchangerRepository.softRemove(heatExchanger)
  }
}
