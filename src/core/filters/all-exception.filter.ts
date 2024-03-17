import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { LogService } from 'src/log/log.service';

@Catch(HttpException)
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly logService: LogService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    // 添加异常日志
    const { method, path, body } = request;
    const IPAddress = request.headers['x-forwarded-for'] ? (Array.isArray(request.headers['x-forwarded-for'])
    ? (request.headers['x-forwarded-for'] as string[])[0]
    : request.headers['x-forwarded-for']) : request.connection.remoteAddress
    
    const userAgent = request.headers['user-agent']

    let userId: string | null, userName: string | null
    if (request.user) {
      const user = request.user as { userId: string, userName: string }
      userId = user.userId
      userName = user.userName
    }
    this.logService.createErrorLog(userId, userName, IPAddress, method, path, userAgent, exception, body);

    // 返回异常信息
    response
      .status(status)
      .json({
        code: status,
        message: exception.message,
        success:false,
        data:null,
        timestamp: Date.now(),
        // path: request.url
      });
  }
}