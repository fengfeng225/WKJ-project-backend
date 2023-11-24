import { ExecutionContext, Injectable, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Require_Login_Key } from 'src/decorators/require-login';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector:Reflector
  ){
    super()
  }
  canActivate(context: ExecutionContext) {
    // 在这里添加自定义的认证逻辑
    const requirdLogin = this.reflector.getAllAndOverride<boolean>(Require_Login_Key,[
      context.getHandler(),
      context.getClass()
    ])
    // 一旦使用注解，就通过
    if(requirdLogin) return true
    
    // 例如调用 super.logIn(request) 来建立一个session
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // 可以抛出一个基于info或者err参数的异常
    if (err || !user) {
      throw err || new HttpException('登录状态已过期，请重新登录', 600);
    }
    
    return user;
  }
}
