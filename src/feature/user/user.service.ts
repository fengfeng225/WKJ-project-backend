import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/feature/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  // 注入 一个操作数据表
  constructor(
    @InjectRepository(User)
    private readonly userRepository:Repository<User>
  ){}

  /**
   * 通过登录账号查询用户
   *
   * @param account 登录账号
   */
  async findOneByAccount(account: string): Promise<User> {
    const user = await this.userRepository.findOne({
        where:{
            account
        }
    });
    return user
  }

  /**
   * 通过id查询用户
   *
   * @param id 用户id
   */
  async findOne(id:number):Promise<User|undefined>{

    const user = await this.userRepository.findOne({
        where:{
            id
        }
    });

    return user;
  }

  /**
   * 检验是否存在该用户
   *
   * @param user 用户信息
   */
  async getUser(id: number, account: string): Promise<User> {

    const existUser = await this.userRepository.findOne({
        where:{
            id,
            account
        }
    });
    
    return existUser;
  }
}
