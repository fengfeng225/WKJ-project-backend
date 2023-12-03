import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    if (user && user.enabledMark !== 1) throw new UnauthorizedException('账号被禁用，请联系管理员');

    if(user && user.password === password){
        const {password,...result} = user;
        return result;
    }
    
    return null
  }

  // 登录接口服务层
  async login(loginUserDTO: any) {
    const user = await this.validateUser(loginUserDTO.account, loginUserDTO.password);
    if (!user) throw new UnauthorizedException('账号或密码错误');

    // 签发jwt
    const payload = {account:user.account,userId:user.id};
    const token = this.jwtService.sign(payload)

    return {
      token: 'Bearer ' + token
    }
  }

  // 获取用户信息及权限
  async getProfile(userId: string, account: string) {
    
    const userInfo = await this.userService.getUserInfoForInit(userId);
    
    const { menuList = [], permissionList = [] } = await this.userService.getPermissionListByUserId(userId, account)
    
    return {
      userInfo,
      menuList,
      permissionList
    }
  }
}
