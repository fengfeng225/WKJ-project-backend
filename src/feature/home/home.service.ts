import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MbLong } from '../bill/mb/entities/mb-long.entity';
import { MbShort } from '../bill/mb/entities/mb-short.entity';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(MbLong)
    private readonly longRepository:Repository<MbLong>,
    @InjectRepository(MbShort)
    private readonly shortRepository:Repository<MbShort>
  ){}

  async findAll() {
    const totalShort = await this.shortRepository.count()
    const totalLong = await this.longRepository.count()
    
    return {
      totalShort: totalShort,
      totalLong: totalLong
    }
  }
}
