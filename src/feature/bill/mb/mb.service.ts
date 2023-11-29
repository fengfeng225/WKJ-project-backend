import { HttpException, Injectable } from '@nestjs/common';
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
        classId: createMbDto.classId,
        deleteMark: 0
      }
    })

    if (isExist) throw new HttpException('该盲板已存在，请重试', 400)
    
    // 事务
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(MbShort, createMbDto)
      const disassemblyInfo = {...createMbDto, remark: '新增盲板', cycleType: 'short'}
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
    const query = this.shortRepository.createQueryBuilder('mbShort').where('deleteMark = 0');
    
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
    const list = await this.shortRepository.find({
      where: {
        deleteMark: 0
      }
    })
    return {
      list
    }
  }

  async findOneShortBill(id: number) {
    return await this.shortRepository.findOne({
      where: {
        id
      }
    })
  }

  async updateShortBill(id: number, updateMbDto: UpdateMbDto) {
    // 编号长度小于3，用0补齐
    if (updateMbDto.code.length < 3) updateMbDto.code = this.leftFillZero(updateMbDto.code, 3)
    
    const shortBill = await this.shortRepository.findOne({
      where: {
        id
      }
    })

    if (!shortBill) throw new HttpException('无效的盲板', 400)

    const isExist = await this.shortRepository.findOne({
      where: {
        code: updateMbDto.code,
        classId: updateMbDto.classId,
        deleteMark: 0,
        id: Not(id)
      }
    })

    if (isExist) throw new HttpException('当前班组已存在相同编号的盲板，请重试', 400)

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
      const disassemblyInfo = {...updateMbDto, remark: `切换为 ${updateMbDto.status}`, cycleType: 'short'}
      await this.addDisassembly(disassemblyInfo, transactionalEntityManager)
    })

    return null
  }

  async removeShortBill(id: number) {
    const shortBill = await this.shortRepository.findOne({
      where: {
        id
      }
    })
    // 事务
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.update(MbShort, id, {deleteMark: 1})
      const disassemblyInfo = {...shortBill, remark: '删除盲板', cycleType: 'short'}
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
        classId: createMbDto.classId,
        deleteMark: 0
      }
    })

    if (isExist) throw new HttpException('该盲板已存在，请重试', 400)

    await this.longRepository.save(createMbDto)
    return null
  }

  async findLongBill({
    keyword,
    classId,
    pageSize = 20,
    currentPage = 1,
    queryJson
  }): Promise<{ list: MbShort[], pagination: { total: number, pageSize: number, pageIndex: number } }> {
    const query = this.longRepository.createQueryBuilder('mbShort').where('deleteMark = 0');
    
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
    const list = await this.longRepository.find({
      where: {
        deleteMark: 0
      }
    })
    return {
      list
    }
  }

  async findOneLongBill(id: number) {
    return await this.longRepository.findOne({
      where: {
        id
      }
    })
  }

  async updateLongBill(id: number, updateMbDto: UpdateMbDto) {
    // 编号长度小于3，用0补齐
    if (updateMbDto.code.length < 3) updateMbDto.code = this.leftFillZero(updateMbDto.code, 3)
    
    const shortBill = await this.longRepository.findOne({
      where: {
        id
      }
    })

    if (!shortBill) throw new HttpException('无效的盲板', 400)

    const isExist = await this.longRepository.findOne({
      where: {
        code: updateMbDto.code,
        classId: updateMbDto.classId,
        deleteMark: 0,
        id: Not(id)
      }
    })

    if (isExist) throw new HttpException('当前班组已存在相同编号的盲板，请重试', 400)
    
    await this.longRepository.save(updateMbDto)
    return null
  }

  async removeLongBill(id: number) {
    const result = await this.longRepository
    .createQueryBuilder()
    .update()
    .set({deleteMark: 1})
    .where("id = :id", { id })
    .execute()

    if (result.affected === 1) return null
  }


  // class
  async findAllClass(): Promise<{list: MbClass[]}> {
    const list =  await this.classRepository.find()
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

  // 添加拆装明细
  async addDisassembly(createDisassemblyDto: CreateDisassemblyDto, manager) {
    await manager.save(MbDisassembly, createDisassemblyDto)
  }

  // 左边补零
  private leftFillZero(val: string, count: number): string {
    return new Array(count - val.length + 1).join('0') + val
  }

  // 初始测试数据
  async initClass() {
    const class1 = new MbClass()
    class1.label = '白油一班'

    const class2 = new MbClass()
    class2.label = '白油二班'

    const class3 = new MbClass()
    class3.label = '白油三班'

    const class4 = new MbClass()
    class4.label = '白油四班'

    const class5 = new MbClass()
    class5.label = '高加一班'

    const class6 = new MbClass()
    class6.label = '高加二班'

    const class7 = new MbClass()
    class7.label = '高加三班'

    const class8 = new MbClass()
    class8.label = '高加四班'

    await this.classRepository.save([class1, class2, class3, class4, class5, class6, class7, class8, ])
  }
}
