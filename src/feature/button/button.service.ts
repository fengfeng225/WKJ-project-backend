import { ConflictException, NotFoundException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Button_permission } from './entities/button_permission.entity';
import { CreateButtonDto } from './dto/create-button.dto';
import { UpdateButtonDto } from './dto/update-button.dto';

@Injectable()
export class ButtonService {
  constructor(
    @InjectRepository(Button_permission)
    private readonly buttonRepository:Repository<Button_permission>
  ){}

  async create(createButtonDto: CreateButtonDto) {
    const isExist = await this.buttonRepository.findOne({
      where: [
        { fullName: createButtonDto.fullName, menuId: createButtonDto.menuId },
        { entityCode:createButtonDto.entityCode, menuId: createButtonDto.menuId }
      ]
    })

    if (isExist) throw new ConflictException('名称或编码重复')

    const entity = this.buttonRepository.create(createButtonDto)
    await this.buttonRepository.save(entity)
    return null
  }

  async findAll(id: string) {
    const buttons = await this.buttonRepository
    .createQueryBuilder('button')
    .where('button.menuId = :id', {id})
    .orderBy('button.sortCode')
    .getMany()

    return {
      list: buttons
    }
  }

  async findOne(id: string) {
    const button = await this.buttonRepository.findOne({
      where: {
        id
      }
    })
    if(!button) throw new NotFoundException('没有找到按钮')
    return button
  }

  async update(id: string, updateButtonDto: UpdateButtonDto) {
    const button = await this.buttonRepository.findOne({
      where: {
        id
      }
    })

    if (!button) throw new NotFoundException('没有找到按钮')

    const isExist = await this.buttonRepository.findOne({
      where: [
        { fullName: updateButtonDto.fullName, menuId: updateButtonDto.menuId, id: Not(updateButtonDto.id) },
        { entityCode: updateButtonDto.entityCode, menuId: updateButtonDto.menuId, id: Not(updateButtonDto.id) }
      ]
    })

    if (isExist) throw new ConflictException('名称或编码重复')
    
    await this.buttonRepository.save(updateButtonDto)
    return null
  }

  async remove(id: string) {
    await this.buttonRepository
    .createQueryBuilder()
    .delete()
    .where('id = :id', {id})
    .execute()
    
    return null
  }
}
