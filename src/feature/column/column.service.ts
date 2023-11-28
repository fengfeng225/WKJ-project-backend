import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Column_permission } from './entities/column_permission.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(Column_permission)
    private readonly columnRepository:Repository<Column_permission>
  ){}

  async create(createColumnDto: CreateColumnDto) {
    const isExist = await this.columnRepository.findOne({
      where: [
        { fullName: createColumnDto.fullName, menuId: createColumnDto.menuId },
        { entityCode:createColumnDto.entityCode, menuId: createColumnDto.menuId }
      ]
    })

    if (isExist) throw new HttpException('名称或编码重复', 400)

    await this.columnRepository.save(createColumnDto)
    return null
  }

  async batchCreate(columnData) {
    const menuId = columnData.menuId
    const columns = columnData.columnJson
    columns.forEach(column => column.menuId = menuId)

    await this.columnRepository
    .createQueryBuilder()
    .insert()
    .values(columns)
    .execute()

    return null
  }

  async findAll(id: number) {
    const buttons = await this.columnRepository.find({
      where: {
        menuId: id
      }
    })

    return {
      list: buttons
    }
  }

  async findOne(id: number) {
    return await this.columnRepository.findOne({
      where: {
        id
      }
    })
  }

  async update(id: number, updateColumnDto: UpdateColumnDto) {
    const button = await this.columnRepository.findOne({
      where: {
        id
      }
    })

    if (!button) throw new HttpException('无效的表格列', 400)

    const isExist = await this.columnRepository.findOne({
      where: [
        { fullName: updateColumnDto.fullName, menuId: updateColumnDto.menuId, id: Not(updateColumnDto.id) },
        { entityCode: updateColumnDto.entityCode, menuId: updateColumnDto.menuId, id: Not(updateColumnDto.id) }
      ]
    })

    if (isExist) throw new HttpException('名称或编码重复', 400)
    
    await this.columnRepository.save(updateColumnDto)
    return null
  }

  async remove(id: number) {
    const result = await this.columnRepository
    .createQueryBuilder()
    .delete()
    .where('id = :id', {id})
    .execute()
    
    if (result.affected === 1) return null
  }
}
