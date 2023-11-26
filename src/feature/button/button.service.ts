import { HttpException, Injectable } from '@nestjs/common';
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
        { fullName: createButtonDto.fullName },
        { entityCode:createButtonDto.entityCode }
      ]
    })

    if (isExist) throw new HttpException('名称或编码重复', 400)

    return await this.buttonRepository.save(createButtonDto)
  }

  async findAll(id: number) {
    const buttons = await this.buttonRepository.find({
      where: {
        menuId: id
      }
    })

    return {
      list: buttons
    }
  }

  async findOne(id: number) {
    return await this.buttonRepository.findOne({
      where: {
        id
      }
    })
  }

  async update(id: number, updateButtonDto: UpdateButtonDto) {
    const button = await this.buttonRepository.findOne({
      where: {
        id
      }
    })

    if (!button) throw new HttpException('无效的按钮', 500)

    const isExist = await this.buttonRepository.findOne({
      where: [
        { fullName: updateButtonDto.fullName, id: Not(updateButtonDto.id) },
        { entityCode: updateButtonDto.entityCode, id: Not(updateButtonDto.id) }
      ]
    })

    if (isExist) throw new HttpException('名称或编码重复', 400)
    
    await this.buttonRepository.save(updateButtonDto)
    return null
  }

  async remove(id: number) {
    const result = await this.buttonRepository
    .createQueryBuilder()
    .delete()
    .where('id = :id', {id})
    .execute()
    
    if (result.affected === 1) return null
  }
}
