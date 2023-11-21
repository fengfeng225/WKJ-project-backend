import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from "./auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {		// 此处的 Strategy 要引入 passport-local 中的 
  constructor(
    private readonly authService:AuthService
  ) {
    super({
      usernameField: 'account',	// 固定写法，指定用户名字段，可以为 phone 或 email 等其他字段，不影响
      passwordField: 'password',	// 固定写法，指定密码字段
    });
  }

  async validate(account: string, password: string): Promise<any> {		// 必须实现一个 validate 方法
    const user = await this.authService.validateUser(account,password);

    if (!user) throw new UnauthorizedException();

    return user;
  }
}
