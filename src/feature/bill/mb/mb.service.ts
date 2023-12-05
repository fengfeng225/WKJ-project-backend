import { ConflictException, NotFoundException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, DataSource } from 'typeorm';
import { CreateMbDto } from './dto/create-mb.dto';
import { UpdateMbDto } from './dto/update-mb.dto';
import { CreateDisassemblyDto } from './dto/create-disassembly.dto';
import { MbClass } from './entities/mb-class.entity';
import { MbShort } from './entities/mb-short.entity';
import { MbLong } from './entities/mb-long.entity';
import { MbDisassembly } from './entities/mb-disassembly.entity';

@Injectable()
export class MbService {
  constructor(
    @InjectRepository(MbClass)
    private readonly classRepository:Repository<MbClass>,
    @InjectRepository(MbShort)
    private readonly shortRepository:Repository<MbShort>,
    @InjectRepository(MbLong)
    private readonly longRepository:Repository<MbLong>,
    @InjectRepository(MbDisassembly)
    private readonly disassemblyRepository:Repository<MbDisassembly>,
    private dataSource: DataSource
  ){}

  // shortBill
  async createShortBill(createMbDto: CreateMbDto) {
    // 编号长度小于3，用0补齐
    if (createMbDto.code.length < 3) createMbDto.code = this.leftFillZero(createMbDto.code, 3)

    const isExist = await this.shortRepository.findOne({
      where: {
        code: createMbDto.code,
        classId: createMbDto.classId
      }
    })

    if (isExist) throw new ConflictException('当前班组已存在相同编号的盲板，请重试')
    
    // 事务
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const entity = this.shortRepository.create(createMbDto)
      await transactionalEntityManager.save(entity)
      const disassemblyInfo = {...createMbDto, remark: '新增', cycleType: 'short'}
      await this.addDisassembly(disassemblyInfo, transactionalEntityManager)
    })

    return null
  }

  async findShortBill({
    keyword,
    classId,
    pageSize = 20,
    currentPage = 1,
    queryJson
  }): Promise<{ list: MbShort[], pagination: { total: number, pageSize: number, pageIndex: number } }> {
    const query = this.shortRepository.createQueryBuilder('mbShort');
    
    if (keyword) {
      query.andWhere(`code LIKE :keyword`, { keyword: `%${keyword}%` });
    }
    if (classId && +classId !== -1) {      
      query.andWhere(`classId = :classId`, { classId });
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

  async findAllShortBill() {
    const list = await this.shortRepository.find()
    return {
      list
    }
  }

  async findOneShortBill(id: string) {
    const shortBill = await this.shortRepository.findOne({
      where: {
        id
      }
    })

    if (!shortBill) throw new NotFoundException('没有找到盲板信息')

    return shortBill
  }

  async updateShortBill(id: string, updateMbDto: UpdateMbDto) {
    // 编号长度小于3，用0补齐
    if (updateMbDto.code.length < 3) updateMbDto.code = this.leftFillZero(updateMbDto.code, 3)
    
    const shortBill = await this.shortRepository.findOne({
      where: {
        id
      }
    })

    if (!shortBill) throw new NotFoundException('没有找到盲板信息')

    const isExist = await this.shortRepository.findOne({
      where: {
        code: updateMbDto.code,
        classId: updateMbDto.classId,
        id: Not(id)
      }
    })

    if (isExist) throw new ConflictException('当前班组已存在相同编号的盲板，请重试')

    // 判断是否切换盲通
    const oldStatus = shortBill.status
    if (updateMbDto.status === oldStatus) {
      // 没切换
      await this.shortRepository.save(updateMbDto)
      return null
    }
    
    // 切换，事务处理
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(MbShort, updateMbDto)
      const { id, ...basicInfo } = updateMbDto
      const disassemblyInfo = {...basicInfo, remark: `切换为 ${updateMbDto.status}`, cycleType: 'short'}
      await this.addDisassembly(disassemblyInfo, transactionalEntityManager)
    })

    return null
  }

  async removeShortBill(shortId: string) {
    const creatorTime = new Date()
    const shortBill = await this.shortRepository.findOne({
      where: {
        id: shortId
      }
    })
    // 事务
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.softRemove(shortBill)
      const { id, ...basicInfo } = shortBill
      const disassemblyInfo = {...basicInfo, disassembleTime: creatorTime, remark: '删除', cycleType: 'short'}
      await this.addDisassembly(disassemblyInfo, transactionalEntityManager)
    })

    return null
  }


  // longBill
  async createLongBill(createMbDto: CreateMbDto) {
    // 编号长度小于3，用0补齐
    if (createMbDto.code.length < 3) createMbDto.code = this.leftFillZero(createMbDto.code, 3)

    const isExist = await this.longRepository.findOne({
      where: {
        code: createMbDto.code,
        classId: createMbDto.classId
      }
    })

    if (isExist) throw new ConflictException('当前班组已存在相同编号的盲板，请重试')

    // 事务
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const entity = this.longRepository.create(createMbDto)
      await transactionalEntityManager.save(entity)
      const disassemblyInfo = {...createMbDto, remark: '新增', cycleType: 'long'}
      await this.addDisassembly(disassemblyInfo, transactionalEntityManager)
    })

    return null
  }

  async findLongBill({
    keyword,
    classId,
    pageSize = 20,
    currentPage = 1,
    queryJson
  }): Promise<{ list: MbLong[], pagination: { total: number, pageSize: number, pageIndex: number } }> {
    const query = this.longRepository.createQueryBuilder('mbLong');
    
    if (keyword) {
      query.andWhere(`code LIKE :keyword`, { keyword: `%${keyword}%` });
    }
    if (classId && +classId !== -1) {      
      query.andWhere(`classId = :classId`, { classId });
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

  async findAllLongBill() {
    const list = await this.longRepository.find()
    return {
      list
    }
  }

  async findOneLongBill(id: string) {
    const longBill = await this.longRepository.findOne({
      where: {
        id
      }
    })

    if(!longBill) throw new NotFoundException('没有找到盲板信息')

    return longBill
  }

  async updateLongBill(id: string, updateMbDto: UpdateMbDto) {
    // 编号长度小于3，用0补齐
    if (updateMbDto.code.length < 3) updateMbDto.code = this.leftFillZero(updateMbDto.code, 3)
    
    const longBill = await this.longRepository.findOne({
      where: {
        id
      }
    })

    if (!longBill) throw new NotFoundException('没有找到盲板信息')

    const isExist = await this.longRepository.findOne({
      where: {
        code: updateMbDto.code,
        classId: updateMbDto.classId,
        id: Not(id)
      }
    })

    if (isExist) throw new ConflictException('当前班组已存在相同编号的盲板，请重试')
    
    // 判断是否切换盲通
    const oldStatus = longBill.status
    if (updateMbDto.status === oldStatus) {
      // 没切换
      await this.longRepository.save(updateMbDto)
      return null
    }

    // 切换，事务处理
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(MbLong, updateMbDto)
      const { id, ...basicInfo } = updateMbDto
      const disassemblyInfo = {...basicInfo, remark: `切换为 ${updateMbDto.status}`, cycleType: 'long'}
      await this.addDisassembly(disassemblyInfo, transactionalEntityManager)
    })

    return null
  }

  async removeLongBill(longId: string) {
    const creatorTime = new Date()
    const longBill = await this.longRepository.findOne({
      where: {
        id: longId
      }
    })
    // 事务
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.softRemove(longBill)
      const { id, ...basicInfo } = longBill
      const disassemblyInfo = {...basicInfo, disassembleTime: creatorTime, remark: '删除', cycleType: 'long'}
      await this.addDisassembly(disassemblyInfo, transactionalEntityManager)
    })

    return null
  }


  // 获取班组
  async findAllClass(): Promise<{list: MbClass[]}> {
    const list =  await this.classRepository
    .createQueryBuilder('class')
    .select(['class.id', 'class.fullName'])
    .orderBy('sortCode')
    .getMany()

    return {
      list
    }
  }

  // 获取拆装明细
  async findDisassembleDetails({
    keyword,
    classId,
    pageSize = 20,
    currentPage = 1
  }): Promise<{ list: MbDisassembly[], pagination: { total: number, pageSize: number, pageIndex: number } }> {
    const query = this.disassemblyRepository.createQueryBuilder('disassembly').orderBy("disassembly.creatorTime", "DESC");
    
    if (keyword) {
      query.andWhere(`code LIKE :keyword`, { keyword: `%${keyword}%` });
    }
    if (classId && +classId !== -1) {      
      query.andWhere(`classId = :classId`, { classId });
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

  // 删除拆装明细
  async removeDisassembleDetail(id: string) {
    const disassembleDetail = await this.disassemblyRepository.findOne({
      where: {
        id
      }
    })

    if (!disassembleDetail) throw new NotFoundException('没有找到相关明细')

    await this.disassemblyRepository.softRemove(disassembleDetail)
    return null
  }

  // 添加拆装明细
  async addDisassembly(createDisassemblyDto: CreateDisassemblyDto, manager) {
    const entity = this.disassemblyRepository.create(createDisassemblyDto)
    await manager.save(entity)
  }

  // 左边补零
  private leftFillZero(val: string, count: number): string {
    return new Array(count - val.length + 1).join('0') + val
  }

  // 初始测试数据
  async initClass() {
    const class1 = new MbClass()
    class1.fullName = '白油一班'

    const class2 = new MbClass()
    class2.fullName = '白油二班'

    const class3 = new MbClass()
    class3.fullName = '白油三班'

    const class4 = new MbClass()
    class4.fullName = '白油四班'

    const class5 = new MbClass()
    class5.fullName = '高加一班'

    const class6 = new MbClass()
    class6.fullName = '高加二班'

    const class7 = new MbClass()
    class7.fullName = '高加三班'

    const class8 = new MbClass()
    class8.fullName = '高加四班'

    await this.classRepository.save([class1, class2, class3, class4, class5, class6, class7, class8, ])
  }
}
