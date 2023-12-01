import { ConflictException, NotFoundException, Injectable } from '@nestjs/common';
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

    if (isExist) throw new ConflictException('名称或编码重复')

    const entity = this.columnRepository.create(createColumnDto)
    await this.columnRepository.save(entity)
    return null
  }

  async batchCreate(menuId: string, columnData) {
    const columns = columnData.columnJson
    columns.forEach(column => column.menuId = menuId)

    await this.columnRepository
    .createQueryBuilder()
    .insert()
    .values(columns)
    .execute()

    return null
  }

  async findAll(id: string) {
    const columns = await this.columnRepository
    .createQueryBuilder('column')
    .where('column.menuId = :id', {id})
    .orderBy('column.sortCode')
    .getMany()

    return {
      list: columns
    }
  }

  async findOne(id: string) {
    return await this.columnRepository.findOne({
      where: {
        id
      }
    })
  }

  async update(id: string, updateColumnDto: UpdateColumnDto) {
    const column = await this.columnRepository.findOne({
      where: {
        id
      }
    })

    if (!column) throw new NotFoundException('没有找到表格列')

    const isExist = await this.columnRepository.findOne({
      where: [
        { fullName: updateColumnDto.fullName, menuId: updateColumnDto.menuId, id: Not(updateColumnDto.id) },
        { entityCode: updateColumnDto.entityCode, menuId: updateColumnDto.menuId, id: Not(updateColumnDto.id) }
      ]
    })

    if (isExist) throw new ConflictException('名称或编码重复')
    
    await this.columnRepository.save(updateColumnDto)
    return null
  }

  async remove(id: string) {
    await this.columnRepository
    .createQueryBuilder()
    .delete()
    .where('id = :id', {id})
    .execute()
    
    return null
  }
}
