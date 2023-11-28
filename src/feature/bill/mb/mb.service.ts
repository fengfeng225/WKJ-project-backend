import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CreateMbDto } from './dto/create-mb.dto';
import { UpdateMbDto } from './dto/update-mb.dto';
import { MbClass } from './entities/mb-class.entity';
import { MbShort } from './entities/mb-short.entity';
import { MbLong } from './entities/mb-long.entity';

@Injectable()
export class MbService {
  constructor(
    @InjectRepository(MbClass)
    private readonly classRepository:Repository<MbClass>,
    @InjectRepository(MbShort)
    private readonly shortRepository:Repository<MbShort>,
    @InjectRepository(MbLong)
    private readonly longRepository:Repository<MbLong>,
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

    await this.shortRepository.save(createMbDto)
    return null
  }

  async findAllShortBill({
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
    
    await this.shortRepository.save(updateMbDto)
    return null
  }

  async removeShortBill(id: number) {
    const result = await this.shortRepository
    .createQueryBuilder()
    .update()
    .set({deleteMark: 1})
    .where("id = :id", { id })
    .execute()

    if (result.affected === 1) return null
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

  async findAllLongBill({
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
