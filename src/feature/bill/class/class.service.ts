import { ConflictException, NotFoundException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, DataSource } from 'typeorm';
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
    private readonly recordRepository:Repository<CheckRecord>,
    private dataSource: DataSource
  ){}
  
  // classBasic
  async findAllClass(): Promise<{list: BillClass[]}> {
    const list = await this.classRepository
    .createQueryBuilder('class')
    .leftJoinAndSelect('class.children', 'children')
    .select(['class.id', 'class.fullName', 'children.id', 'children.fullName'])
    .where('class.parentId IS NULL')
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
    .select(['class.id', 'class.fullName'])
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
    .select(['class.id', 'class.fullName'])
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
    return null
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
    return null
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
    return null
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

  async findAllClassWithCheckStatus(): Promise<{list: BillClass[]}> {
    const list = await this.classRepository
    .createQueryBuilder('class')
    .leftJoinAndSelect('class.children', 'children')
    .where('class.parentId IS NULL')
    .orderBy('class.sortCode')
    .addOrderBy('children.sortCode')
    .getMany()

    return {
      list
    }
  }

  async findParentClassWithCheckStatus(): Promise<{list: BillClass[]}> {
    const list = await this.classRepository
    .createQueryBuilder('class')
    .where('class.parentId IS NULL')
    .orderBy('class.sortCode')
    .getMany()

    return {
      list
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
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(CheckRecord, checkRecords)

      // 将对应班组当前检查状态改为完成
      const classes = await this.classRepository
      .createQueryBuilder('class')
      .where('id IN (:...classIds)', {classIds})
      .getMany()
      const currentStatusName = type + 'CheckingStatus'
      classes.forEach(item => item[currentStatusName] = 1)
      await transactionalEntityManager.save(BillClass, classes)
    })

    return null
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

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      // 修改历史检查记录
      record.checkStatus = 2
      record.description = fixRecordDto.description
      await transactionalEntityManager.save(CheckRecord, record)

      // 更新对应班组历史检查状态
      const incompleteCheck = await this.recordRepository.find({
        where: {
          checking: 0,
          checkStatus: -1,
          classId: record.classId,
          entityCode: record.entityCode
        }
      })
      if (incompleteCheck.length === 0) {
        const currentClass = await this.classRepository.findOne({
          where: {
            id: record.classId
          }
        })
        currentClass[record.entityCode + 'CheckedStatus'] = 1
        await transactionalEntityManager.save(BillClass, currentClass)
      }
    })

    return null
  }

  // 初始测试数据
  async initClass() {
    const class9 = new BillClass()
    class9.fullName = '白油加氢班组'

    const class10 = new BillClass()
    class10.fullName = '高压加氢班组'

    const class1 = new BillClass()
    class1.fullName = '白油一班'

    const class2 = new BillClass()
    class2.fullName = '白油二班'

    const class3 = new BillClass()
    class3.fullName = '白油三班'

    const class4 = new BillClass()
    class4.fullName = '白油四班'

    const class5 = new BillClass()
    class5.fullName = '高加一班'

    const class6 = new BillClass()
    class6.fullName = '高加二班'

    const class7 = new BillClass()
    class7.fullName = '高加三班'

    const class8 = new BillClass()
    class8.fullName = '高加四班'

    class9.children = [class1, class2, class3, class4]
    class10.children = [class5, class6, class7, class8]

    await this.classRepository.save([class9, class10])
  }
}
