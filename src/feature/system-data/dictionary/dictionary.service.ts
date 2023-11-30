import { ConflictException, NotFoundException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, DataSource } from 'typeorm';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { Dictionary } from './entities/dictionary.entity';
import { SelectOption } from './entities/option.entity';

@Injectable()
export class DictionaryService {
  constructor(
    @InjectRepository(Dictionary)
    private readonly dictionaryRepository:Repository<Dictionary>,
    @InjectRepository(SelectOption)
    private readonly optionRepository:Repository<SelectOption>,
    private dataSource: DataSource
  ){}

  // 字段
  async createDictionary(createDictionaryDto: CreateDictionaryDto) {
    const isExist = await this.dictionaryRepository.findOne({
      where: [
        { fullName: createDictionaryDto.fullName },
        { entityCode: createDictionaryDto.entityCode }
      ]
    })

    if (isExist) throw new ConflictException('名称或编码重复')

    await this.dictionaryRepository.save(createDictionaryDto)
    return null
  }

  async findAllDictionary() {
    const list = await this.dictionaryRepository.find()
    return {
      list
    }
  }

  async findOneDictionary(id: number) {
    return await this.dictionaryRepository.findOne({
      where: {
        id
      }
    })
  }

  async updateDictionary(id: number, updateDictionaryDto: UpdateDictionaryDto) {
    const dictionary = await this.dictionaryRepository.findOne({
      where: {
        id
      }
    })

    if (!dictionary) throw new NotFoundException('没有找到字段')

    const isExist = await this.dictionaryRepository.findOne({
      where: [
        { fullName: updateDictionaryDto.fullName, id: Not(id) },
        { entityCode: updateDictionaryDto.entityCode, id: Not(id) }
      ]
    })

    if (isExist) throw new ConflictException('名称或编码重复')
    
    await this.dictionaryRepository.save(updateDictionaryDto)
    return null
  }

  async removeDictionary(id: number) {
    // 查找要删除的 dictionary 对象
    const dictionary = await this.dictionaryRepository.findOne({
      where: {
        id
      },
      relations: {
        options: true
      }
    })

    // 如果找不到该 dictionary
    if (!dictionary) throw new NotFoundException('没有找到字段');

    // 开启事务
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      // 删除关联的 option 对象
      for (const option of dictionary.options) {
        await transactionalEntityManager.remove(option);
      }

      // 删除 dictionary 对象
      await transactionalEntityManager.remove(dictionary);
    })

    return null
  }

  // 选项
  async findAllOptionByCode(code: string) {
    let list

    const dictionary = await this.dictionaryRepository.findOne({
      where: {
        entityCode: code
      }
    })

    if (!dictionary) {
      list = []
    } else {
      list = await this.optionRepository.find({
        where: {
          dictionaryId: dictionary.id
        }
      })
    }
    
    return {
      list
    }
  }

  async createOption(createOptionDto: CreateOptionDto) {
    const isExist = await this.optionRepository.findOne({
      where: [
        { fullName: createOptionDto.fullName, dictionaryId: createOptionDto.dictionaryId },
        { entityCode: createOptionDto.entityCode, dictionaryId: createOptionDto.dictionaryId }
      ]
    })

    if (isExist) throw new ConflictException('名称或编码重复')

    await this.optionRepository.save(createOptionDto)
    return null
  }

  async findAllOption(id: number, keyword: string) {
    const query = this.optionRepository.createQueryBuilder().where('dictionaryId = :id', {id})

    if (keyword) query.andWhere(`fullName LIKE :keyword`, { keyword: `%${keyword}%` })

    const list = await query.getMany()
    return {
      list
    }
  }

  async findOneOption(id: number) {
    return await this.optionRepository.findOne({
      where: {
        id
      }
    })
  }

  async updateOption(id: number, updateOptionDto: UpdateOptionDto) {
    const option = await this.optionRepository.findOne({
      where: {
        id
      }
    })

    if (!option) throw new NotFoundException('没有找到选项')

    const isExist = await this.optionRepository.findOne({
      where: [
        { fullName: updateOptionDto.fullName, dictionaryId: updateOptionDto.dictionaryId, id: Not(id) },
        { entityCode: updateOptionDto.entityCode, dictionaryId: updateOptionDto.dictionaryId, id: Not(id) }
      ]
    })

    if (isExist) throw new ConflictException('名称或编码重复')
    
    await this.optionRepository.save(updateOptionDto)
    return null
  }

  async removeOption(id: number) {
    const result = await this.optionRepository
    .createQueryBuilder()
    .delete()
    .where("id = :id", { id })
    .execute()

    if (result.affected === 1) return null
  }
}
