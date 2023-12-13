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

  async createLog(
    requestMethod: string,
    requestURL: string,
    requestData: object,
    userName: string,
    userAgent: string
  ): Promise<Log> {
    const log = new Log(requestMethod, requestURL, requestData, userName, userAgent, 'success');
    return this.logRepository.save(log);
  }
}
