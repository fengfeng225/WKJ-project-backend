import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository:Repository<Log>
  ){}

  async createLog(method: string, path: string, requestData: object): Promise<Log> {
    const log = new Log(method, path, requestData);
    console.log(log)
    return this.logRepository.save(log);
  }
}
