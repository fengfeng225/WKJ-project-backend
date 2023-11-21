import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
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

  async findOne(id:number):Promise<User|undefined>{

    const user = await this.userRepository.findOne({
        where:{
            id
        }
    });

    return user;
  }
}
