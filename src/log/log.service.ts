import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';
import { User } from '../feature/user/entities/user.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository:Repository<Log>,
    @InjectRepository(User)
    private readonly userRepository:Repository<User>
  ){}

  // 添加日志
  async createRequestLog(
    userId: string,
    userName: string,
    IPAddress: string,
    requestMethod: string,
    requestURL: string,
    userAgent: string,
    requestData: object,
  ): Promise<Log> {
    const log = new Log();
    log.userId = userId
    log.userName = userName
    log.IPAddress = IPAddress
    log.requestMethod = requestMethod
    log.requestURL = requestURL
    log.userAgent = userAgent
    log.requestData = requestData
    log.category = 2
    return this.logRepository.save(log);
  }

  async createLoginLog(
    account: string,
    IPAddress: string,
    userAgent: string
  ) {
    const user = await this.userRepository.findOne({
      where: {
        account
      }
    })
    if (!user) return

    const log = new Log();
    log.userId = user.id
    log.userName = user.userName
    log.IPAddress = IPAddress
    log.userAgent = userAgent
    log.category = 1
    return this.logRepository.save(log);
  }

  async createErrorLog(
    userId: string,
    userName: string,
    IPAddress: string,
    requestMethod: string,
    requestURL: string,
    userAgent: string,
    exception: any,
    requestData: object
  ): Promise<Log> {
    let exceptionStack: any
    if (exception instanceof Error) {
      exceptionStack = exception.stack; // 保存异常的堆栈信息
    } else {
      exceptionStack = JSON.stringify(exception); // 如果不是 Error 类型，则将整个异常对象转为 JSON 字符串
    }

    const log = new Log();
    log.userId = userId
    log.userName = userName
    log.IPAddress = IPAddress
    log.requestMethod = requestMethod
    log.requestURL = requestURL
    log.userAgent = userAgent
    log.errorMessage = exceptionStack
    log.requestData = requestData
    log.category = 3
    return this.logRepository.save(log);
  }

  // 获取日志
  async getLogList(category: number, {
    keyword,
    startTime,
    endTime,
    pageSize = 20,
    currentPage = 1
  }): Promise<{ list: Log[], pagination: { total: number, pageSize: number, pageIndex: number } }>  {
    const query = this.logRepository.createQueryBuilder('log').where('category = :category', {category}).orderBy('creatorTime', 'DESC');

    if (keyword) {
      query.andWhere(`userName LIKE :keyword OR IPAddress LIKE :keyword`, { keyword: `%${keyword}%` });
    }
    
    if (startTime && endTime) {
      query.andWhere('creatorTime between :startTime and :endTime', {startTime: new Date(+startTime), endTime: new Date(+endTime)})
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

  // 删除日志
  async removeLogs({ ids }) {
    await this.logRepository.delete(ids)
  }
}
