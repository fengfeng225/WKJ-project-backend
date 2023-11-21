import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../feature/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {		// 这里的 Strategy 必须是 passport-jwt 包中的
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET')
    });
  }

  async validate(payload: any) {
    // 是否能获取到用户信息
    const existUser = await this.userService.getUser(payload.userId, payload.userName);
    if (!existUser) {
      throw new UnauthorizedException('无效的token');
    }

    return existUser;
  }
}