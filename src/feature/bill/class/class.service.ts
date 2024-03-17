import { ConflictException, NotFoundException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { FixRecordDto } from './dto/fix-record.dto';
import { BillClass } from './entities/class.entity';
import { CheckRecord } from '../../check-plan/entities/check-record.entity';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(BillClass)
    private readonly classRepository:Repository<BillClass>,
    @InjectRepository(CheckRecord)
    private readonly recordRepository:Repository<CheckRecord>
  ){}

  private buildClassTree(flatClassList): BillClass[] {
    const classMap = new Map<string, BillClass>();
    const result: BillClass[] = [];

    for (const item of flatClassList) {
      classMap.set(item.id, item);
    }

    for (const item of flatClassList) {
      if (item.parentId && classMap.has(item.parentId)) {
        const parent = classMap.get(item.parentId);
        if (!parent.children) parent.children = [];
        parent.children.push(item);
      } else {
        result.push(item);
      }
    }

    return result;
  }

  // 角色拥有的班组
  async findRolePermissionClass(userId: string, account: string): Promise<{list: BillClass[]}> {
    let list: BillClass[]
    if (account === 'admin') {
      list = await this.classRepository
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.children', 'children')
      .where('class.parentId IS NULL')
      .orderBy('class.sortCode')
      .addOrderBy('children.sortCode')
      .getMany()
    } else {
      const flatClasses = await this.classRepository
      .createQueryBuilder('class')
      .innerJoin('role_class_relation', 'rcr', 'rcr.billClassId = class.id')
      .innerJoin('user_role_relation', 'urr', 'urr.roleId = rcr.roleId')
      .where('urr.userId = :userId', { userId })
      .orderBy('class.sortCode')
      .getMany();

      list = this.buildClassTree(flatClasses)
    }

    return {
      list
    }
  }

  // classBasic
  async findAllClass(keyword: string): Promise<{list: BillClass[]}> {
    const list = await this.classRepository
    .createQueryBuilder('class')
    .leftJoinAndSelect('class.children', 'children')
    .where('class.parentId IS NULL')
    .andWhere('class.fullName LIKE :keyword OR children.fullName LIKE :keyword', {keyword: `%${keyword ?? ''}%`})
    .orderBy('class.sortCode')
    .addOrderBy('children.sortCode')
    .getMany()

    return {
      list
    }
  }

  async findClassSelector(): Promise<{list: BillClass[]}> {
    const list = await this.classRepository
    .createQueryBuilder('class')
    .where('class.parentId IS NULL')
    .orderBy('class.sortCode')
    .getMany()

    return {
      list
    }
  }

  async findClassLeaf(): Promise<{list: BillClass[]}> {
    const list = await this.classRepository
    .createQueryBuilder('class')
    .where('class.parentId IS NOT NULL')
    .orderBy('class.sortCode')
    .getMany()

    return {
      list
    }
  }

  // class
  async createClass(createClassDto: CreateClassDto) {
    const isExist = await this.classRepository.findOne({
      where: {
        fullName: createClassDto.fullName
      }
    })

    if (isExist) throw new ConflictException('名称重复，请重试')

    if (createClassDto.parentId === '-1') createClassDto.parentId = null

    const entity = this.classRepository.create(createClassDto) 
    await this.classRepository.save(entity)
  }

  async updateClass(id: string, updateClassDto: UpdateClassDto) {
    const currentClass = await this.classRepository.findOne({
      where: {
        id
      }
    })
    if (!currentClass) throw new NotFoundException('没有找到当前班组')

    const isExist = await this.classRepository.findOne({
      where: {
        fullName: updateClassDto.fullName, id: Not(updateClassDto.id)
      }
    })

    if (isExist) throw new ConflictException('名称重复，请重试')

    const entity = this.classRepository.create(updateClassDto)
    entity.lastModifyTime = new Date()
    await this.classRepository.save(entity)
  }

  async deleteClass(id: string) {
    const hasChildren = await this.classRepository.findOne({
      where: {
        parentId: id
      }
    })

    if (hasChildren) throw new ConflictException('该班组下还存在分班，不允许删除')

    const currentClass = await this.classRepository.findOne({
      where: {
        id
      },
      relations: {
        mbShorts: true,
        mbLongs: true,
        mbDisassemblys: true
      }
    })
    if (!currentClass) throw new NotFoundException('没有找到当前班组')
    if (currentClass.mbShorts.length || currentClass.mbLongs.length || currentClass.mbDisassemblys.length) throw new ForbiddenException('还有相关联的数据，不允许删除！')

    currentClass.lastModifyTime = new Date()
    await this.classRepository.softRemove(currentClass)
  }

  async findOneClass(id: string) {
    const currentClass = await this.classRepository.findOne({
      where: {
        id
      }
    })
    if (!currentClass) throw new NotFoundException('没有获取到当前班组信息')
    return currentClass
  }

  async findAllClassWithCheckStatus(keyword: string): Promise<{list: BillClass[]}> {
    const allClass = await this.classRepository
    .createQueryBuilder('class')
    .where('fullName LIKE :keyword', {keyword: `%${keyword}%`})
    .orderBy('sortCode')
    .getMany()

    const list = instanceToPlain(allClass)

    const currentRecords = await this.recordRepository
    .createQueryBuilder('record')
    .where('checking = 1')
    .getMany()

    const historyRecords = await this.recordRepository
    .createQueryBuilder('record')
    .where('checking = 0')
    .getMany()

    list.forEach(item => {
      const classCurrentRecords = currentRecords.filter(record => record.classId === item.id)
      const classHistoryRecords = historyRecords.filter(record => record.classId === item.id)

      // 当前检查状态
      classCurrentRecords.forEach(record => {
        item[record.entityCode + 'CheckingStatus'] = record.checkStatus
      })

      // 历史检查状态
      const recordEntityCode = [...new Set(classHistoryRecords.map(record => record.entityCode))]
      recordEntityCode.forEach(entityCode => {
        const abnormal = classHistoryRecords.some(record => record.entityCode === entityCode && record.checkStatus === -1)
        if (abnormal) item[entityCode + 'CheckedStatus'] = 0
        else item[entityCode + 'CheckedStatus'] = 1
      })
    })

    const classTreeData = this.buildClassTree(list)

    return {
      list: classTreeData
    }
  }

  // 一键检查
  async checkAll({
    classIds,
    inspector,
    type
  }) {
    classIds = classIds.split(',')
    const checkRecords = await this.recordRepository
    .createQueryBuilder('record')
    .where('checking = 1')
    .andWhere('checkStatus = 0')
    .andWhere('entityCode = :type', {type})
    .andWhere('classId IN (:...classIds)', {classIds})
    .getMany()

    if (!checkRecords.length) throw new NotFoundException('没有找到待检查项')

    // 将当前检查记录改为完成状态
    checkRecords.forEach(item => {
      item.inspector = inspector
      item.checkStatus = 1
      item.checkedTime = new Date()
    })

    await this.recordRepository.save(checkRecords)
  }

  async getRecords(id: string, type: string) {
    const list = await this.recordRepository.find({
      where: {
        classId: id,
        checking: 0,
        entityCode: type
      },
      order: {
        creatorTime: 'DESC'
      }
    })

    return {
      list
    }
  }

  async fixRecord(id: string, fixRecordDto: FixRecordDto) {
    const record = await this.recordRepository.findOne({
      where: {
        id
      }
    })

    if (!record) throw new NotFoundException('没有找到该记录')
    if (record.checkStatus !== -1) throw new ForbiddenException('禁止修改！')

    // 修改历史检查记录
    record.checkStatus = 2
    record.description = fixRecordDto.description
    await this.recordRepository.save(record)
  }
}
