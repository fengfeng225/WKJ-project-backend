import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../feature/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService:UserService,
    private readonly jwtService:JwtService,
  ) {}

  async validateUser(account:string,password:string):Promise<any>{
    const user = await this.userService.findOneByAccount(account);

    if(user && user.password === password){
        const {password,...result} = user;
        return result;
    }
    
    return null
  }

  // 登录接口服务层 签发jwt
  async login(user: any) {
    const payload = {username:user.account,userId:user.id};
    const token = this.jwtService.sign(payload)

    return {
      token: 'Bearer ' + token
    }
  }

  // 获取用户信息
  async getProfile(id: number) {
    const userInfo = await this.userService.findOne(id);

    if (userInfo) return userInfo
    
    return null
  }
}
