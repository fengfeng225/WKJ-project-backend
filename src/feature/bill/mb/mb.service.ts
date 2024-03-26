import { ConflictException, NotFoundException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, DataSource, EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { CreateMbDto } from './dto/create-mb.dto';
import { UpdateMbDto } from './dto/update-mb.dto';
import { CreateDisassemblyDto } from './dto/create-disassembly.dto';
import { MbShort } from './entities/mb-short.entity';
import { MbLong } from './entities/mb-long.entity';
import { MbDisassembly } from './entities/mb-disassembly.entity';
import { BillClass } from '../class/entities/class.entity';

@Injectable()
export class MbService {
  constructor(
    @InjectRepository(MbShort)
    private readonly shortRepository:Repository<MbShort>,
    @InjectRepository(MbLong)
    private readonly longRepository:Repository<MbLong>,
    @InjectRepository(MbDisassembly)
    private readonly disassemblyRepository:Repository<MbDisassembly>,
    @InjectRepository(BillClass)
    private readonly classRepository:Repository<BillClass>,
    private dataSource: DataSource,
    private readonly configService: ConfigService
  ){}

  private imagePath = process.env.NODE_ENV === 'development' ? this.configService.get<string>('imagePath') : path.join(__dirname, this.configService.get<string>('imagePath'))
  private deletedImagePath = process.env.NODE_ENV === 'development' ? this.configService.get<string>('deletedImagePath') : path.join(__dirname, this.configService.get<string>('deletedImagePath'))
  
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
      const classes = await this.classRepository
      .createQueryBuilder('class')
      .select('class.id')
      .where('class.id = :classId OR class.parentId = :classId', {classId})
      .getMany()
      const classIds = classes.map(item => item.id)

      query.andWhere(`classId IN (:...classIds)`, { classIds });
    }
    if (queryJson) {
      query.andWhere(`name IN (:...devices)`, { devices: JSON.parse(queryJson) });
    }


    query.orderBy('status')

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
    } else {
      // 切换，事务处理
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(MbShort, updateMbDto)
        const { id, ...basicInfo } = updateMbDto
        const disassemblyInfo = {...basicInfo, remark: `切换为 ${updateMbDto.status}`, cycleType: 'short'}
        await this.addDisassembly(disassemblyInfo, transactionalEntityManager)
      })
    }
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
      const { id, workflowImage, ...basicInfo } = shortBill
      const disassemblyInfo = {...basicInfo, disassembleTime: creatorTime, remark: '删除', cycleType: 'short'}
      await transactionalEntityManager.softRemove(shortBill)
      await this.addDisassembly(disassemblyInfo, transactionalEntityManager)
      try {
        fs.renameSync(`${this.imagePath}/${workflowImage}`, `${this.deletedImagePath}/${workflowImage}`);
      } catch (error) {
        
      }
    })
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
      const classes = await this.classRepository
      .createQueryBuilder('class')
      .select('class.id')
      .where('class.id = :classId OR class.parentId = :classId', {classId})
      .getMany()
      const classIds = classes.map(item => item.id)

      query.andWhere(`classId IN (:...classIds)`, { classIds });
    }
    if (queryJson) {
      query.andWhere(`name IN (:...devices)`, { devices: JSON.parse(queryJson) });
    }

    query.orderBy('status')

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
    } else {
      // 切换，事务处理
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(MbLong, updateMbDto)
        const { id, ...basicInfo } = updateMbDto
        const disassemblyInfo = {...basicInfo, remark: `切换为 ${updateMbDto.status}`, cycleType: 'long'}
        await this.addDisassembly(disassemblyInfo, transactionalEntityManager)
      })
    }
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
      const { id, workflowImage, ...basicInfo } = longBill
      const disassemblyInfo = {...basicInfo, disassembleTime: creatorTime, remark: '删除', cycleType: 'long'}
      await transactionalEntityManager.softRemove(longBill)
      await this.addDisassembly(disassemblyInfo, transactionalEntityManager)
      try {
        fs.renameSync(`${this.imagePath}/${workflowImage}`, `${this.deletedImagePath}/${workflowImage}`);
      } catch (error) {
        
      }
    })
  }

  // 获取拆装明细
  async findDisassembleDetails({
    keyword,
    classId,
    pageSize = 20,
    currentPage = 1
  }): Promise<{ list: MbDisassembly[], pagination: { total: number, pageSize: number, pageIndex: number } }> {
    const query = this.disassemblyRepository.createQueryBuilder('disassembly').orderBy("disassembly.disassembleTime", "DESC");
    
    if (keyword) {
      query.andWhere(`code LIKE :keyword`, { keyword: `%${keyword}%` });
    }
    if (classId && +classId !== -1) {    
      const classes = await this.classRepository
      .createQueryBuilder('class')
      .select('class.id')
      .where('class.id = :classId OR class.parentId = :classId', {classId})
      .getMany()
      const classIds = classes.map(item => item.id)

      query.andWhere(`classId IN (:...classIds)`, { classIds });
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
  }

  // 添加拆装明细
  async addDisassembly(createDisassemblyDto: CreateDisassemblyDto, manager: EntityManager) {
    const entity = this.disassemblyRepository.create(createDisassemblyDto)
    await manager.save(entity)
  }

  // 左边补零
  private leftFillZero(val: string, count: number): string {
    return new Array(count - val.length + 1).join('0') + val
  }

  // 上传图片
  async uploadFile(id: string, type: string, name: string) {
    let repository: Repository<MbShort | MbLong>    
    if (type === 'shortBill') {
      repository = this.shortRepository
    } else if (type === 'longBill') {
      repository = this.longRepository
    } else {
      throw new NotFoundException('type param not found')
    }

    const bill = await repository.findOne({
      where: {
        id
      }
    })
    bill.workflowImage = name
    await repository.save(bill)
    
    return {
      imageUrl: name
    }
  }

  // 删除图片
  async removeFile(id: string, type: string) {
    let repository: Repository<MbShort | MbLong>    
    if (type === 'shortBill') {
      repository = this.shortRepository
    } else if (type === 'longBill') {
      repository = this.longRepository
    } else {
      throw new NotFoundException('type param not found')
    }

    const bill = await repository.findOne({
      where: {
        id
      }
    })

    let imageName: string = bill.workflowImage
    bill.workflowImage = null
    await repository.save(bill)
    try {
      fs.renameSync(`${this.imagePath}/${imageName}`, `${this.deletedImagePath}/${imageName}`);
    } catch (error) {
      
    }
  }
}
