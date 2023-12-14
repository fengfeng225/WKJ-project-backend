import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { LogService } from 'src/log/log.service';

export interface Response<T> {
  data: T;
}

@Injectable()
export class HttpReqTransformInterceptor<T> 
  implements NestInterceptor<T,Response<T>> 
{
  constructor(private readonly logService: LogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle()
    .pipe(map(data=>{
      // 添加请求日志
      let { method, path, body } = request;
      const IPAddress = request.headers['x-forwarded-for'] || request.connection.remoteAddress
      const userAgent = request.headers['user-agent']

      if (path === '/api/auth/login') {
        this.logService.createLoginLog(body.account, IPAddress, userAgent)
      }

      const userName = request.user?.userName
      const userId = request.user?.userId
      if (body.password) body = {}
      this.logService.createRequestLog(userId, userName, IPAddress, method, path, userAgent, body );

      // 返回请求信息
      return {
        data: data || null,
        code:200,
        message:"操作成功",
        success:true,
        timestamp: Date.now(),
      }
    }))
  }
}