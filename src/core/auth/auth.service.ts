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

    if(user && user.password === password){
        const {password,...result} = user;
        return result;
    }
    
    return null
  }

  // 登录接口服务层 签发jwt
  async login(loginUserDTO: any) {
    const user = await this.validateUser(loginUserDTO.account, loginUserDTO.password);
    if (!user) throw new UnauthorizedException('用户名或密码错误');

    const payload = {username:user.account,userId:user.id};
    const token = this.jwtService.sign(payload)

    return {
      token: 'Bearer ' + token
    }
  }

  // 获取用户信息及权限
  async getProfile(id: number) {
    const userInfo = await this.userService.findOne(id);

    // const Role = await getConnection()
    //   .createQueryBuilder<RoleEntity>(RoleEntity, 'role')
    //   .where('role.id = :id', { id: user.roleId })
    //   .leftJoinAndSelect('role.menus', 'menus')
    //   .getOne();
    
    return {
      userInfo
    }
  }
}
