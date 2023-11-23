import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { Button_permission } from 'src/entities/button_permission.entity';
import { Column_permission } from 'src/entities/column_permission.entity';

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

  // 添加测试数据
  async initData() {

  }
}
