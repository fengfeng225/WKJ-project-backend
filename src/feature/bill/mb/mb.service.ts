import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMbDto } from './dto/create-mb.dto';
import { UpdateMbDto } from './dto/update-mb.dto';
import { MbClass } from './entities/mb-class.entity';

@Injectable()
export class MbService {
  constructor(
    @InjectRepository(MbClass)
    private readonly classRepository:Repository<MbClass>
  ){}

  create(createMbDto: CreateMbDto) {
    return 'This action adds a new mb';
  }

  findAll() {
    return `This action returns all mb`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mb`;
  }

  update(id: number, updateMbDto: UpdateMbDto) {
    return `This action updates a #${id} mb`;
  }

  remove(id: number) {
    return `This action removes a #${id} mb`;
  }

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
