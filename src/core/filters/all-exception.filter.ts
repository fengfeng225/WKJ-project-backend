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

    const { method, path, body } = request;
    console.log(request)
    // const userName = request.user.account
    // const userAgent = request.headers['user-agent']
    // this.logService.createLog(method, path, body, userName, userAgent);

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