import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
// import { LogService } from 'src/log/log.service';

export interface Response<T> {
  data: T;
}

@Injectable()
export class HttpReqTransformInterceptor<T> 
  implements NestInterceptor<T,Response<T>> 
{
  // constructor(private readonly logService?: LogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const { method, path, body } = request;
    // if (this.logService) {
    //   this.logService.createLog(method, path, body);
    // }

    return next.handle()
    .pipe(map(data=>{
      return {
        data,
        code:200,
        message:"操作成功",
        success:true,
        timestamp: Date.now(),
      }
    }))
  }
}