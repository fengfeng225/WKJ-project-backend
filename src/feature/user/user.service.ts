import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { User } from './entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { Menu } from '../menu/entities/menu.entity';
import { BillClass } from '../bill/class/entities/class.entity';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';

@Injectable()
export class UserService {
  // 注入 一个操作数据表
  constructor(
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,
    @InjectRepository(Menu)
    private readonly menuRepository:Repository<Menu>,
    @InjectRepository(Role)
    private readonly roleRepository:Repository<Role>,
    @InjectRepository(BillClass)
    private readonly classRepository:Repository<BillClass>,
  ){}

  private buildMenuTree(flatMenus: Menu[]): Menu[] {
    const menuMap = new Map<string, Menu>();
    const result: Menu[] = [];

    for (const menu of flatMenus) {
      menuMap.set(menu.id, menu);
    }

    for (const menu of flatMenus) {
      if (menu.parentId && menuMap.has(menu.parentId)) {
        const parent = menuMap.get(menu.parentId);
        if (!parent.children) parent.children = [];
        parent.children.push(menu);
      } else {
        result.push(menu);
      }
    }

    return result;
  }
  
  /**
   * 通过登录账号查询用户
   *
   * @param account 登录账号
   */
  async findOneByAccount(account: string): Promise<User> {
    const user = await this.userRepository
    .createQueryBuilder('user')
    .where('account = :account', {account})
    .addSelect('user.password')
    .getOne()

    return user
  }

  // 用于用户初始登录后，获取用户信息
  async getUserInfoForInit(id:string):Promise<User|undefined>{
    const user = await this.userRepository.findOne({
        where:{
            id
        }
    });

    if (!user) throw new UnauthorizedException('用户不存在');

    return user;
  }

  async findAll({
    keyword,
    pageSize = 20,
    currentPage = 1
  }): Promise<{ list: User[], pagination: { total: number, pageSize: number, pageIndex: number } }>  {
    const query = this.userRepository.createQueryBuilder('user').orderBy("user.sortCode");

    if (keyword) query.where(`userName LIKE :keyword`, { keyword: `%${keyword}%` })

    const total = await query.getCount();

    query.skip((currentPage - 1) * pageSize).take(pageSize);

    const list = await query.getMany()
    
    const pagination = {
      pageIndex: +currentPage,
      pageSize: +pageSize,
      total
    }

    return { list, pagination }
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where:{
          id
      },
      relations: {
        roles: true
      }
    });

    if (!user) throw new UnauthorizedException('用户不存在');

    const roleId = user.roles.map(role => role.id)
    const { roles, ...userInfo } = instanceToPlain(user)
    userInfo.roleId = roleId
    return userInfo;
  }

  async create(createUserDto: CreateUserDto) {
    const isExist = await this.userRepository.findOne({
      where: [
        { account: createUserDto.account },
        { userName: createUserDto.userName }
      ]
    })
    if (isExist) throw new ConflictException('账户或名称重复')

    const entity = this.userRepository.create(createUserDto)

    if (createUserDto.roleId.length) {
      const roles = await this.roleRepository
      .createQueryBuilder('role')
      .where('role.id in (:...roleId)', {roleId: createUserDto.roleId})
      .getMany()
      entity.roles = roles
    }
    
    await this.userRepository.save(entity)
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        id
      }
    })

    if (!user) throw new NotFoundException('没有找到用户信息') 

    const isExist = await this.userRepository.findOne({
      where: [
        { account: updateUserDto.account, id: Not(updateUserDto.id) },
        { userName: updateUserDto.userName, id: Not(updateUserDto.id) }
      ]
    })

    if (isExist) throw new ConflictException('名称或编码重复')

    const entity = this.userRepository.create(updateUserDto)
    if (updateUserDto.roleId.length) {
      const roles = await this.roleRepository
      .createQueryBuilder('role')
      .where('role.id in (:...roleId)', {roleId: updateUserDto.roleId})
      .getMany()
      entity.roles = roles
    } else {
      entity.roles = []
    }
    
    await this.userRepository.save(entity)
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id
      }
    })
    
    if (!user) throw new NotFoundException('没有找到用户');

    await this.userRepository.softRemove(user)
  }
  

  // 更新密码
  async updatePassword(userId: string, updateUserPasswordDto: UpdateUserPasswordDto) {
    const user = await this.userRepository
    .createQueryBuilder('user')
    .addSelect('user.password')
    .where('user.id = :userId', {userId})
    .getOne()

    if (!user) throw new NotFoundException('没有找到用户');

    if (updateUserPasswordDto.oldPassword !== user.password) throw new ConflictException('密码输入错误，请重试');

    user.password = updateUserPasswordDto.password
    await this.userRepository.save(user)
  }

  // 重置密码
  async resetPassword(userId: string, resetUserPasswordDto: ResetUserPasswordDto) {
    const user = await this.userRepository
    .createQueryBuilder('user')
    .addSelect('user.password')
    .where('user.id = :userId', {userId})
    .getOne()

    if (!user) throw new NotFoundException('没有找到用户');

    if (resetUserPasswordDto.userPassword !== resetUserPasswordDto.validatePassword) throw new ConflictException('密码输入不一致，请重试');

    user.password = resetUserPasswordDto.userPassword
    await this.userRepository.save(user)
  }

  // 获取用户权限（返回给前端）
  async getPermissionListByUserId(userId: string, account: string) {
    let menus, permissionList, classList

    if (account === 'admin') {
      menus = await this.menuRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.children', 'children')
      .where('menu.enabledMark = 1')
      .andWhere('menu.parentId IS NULL')
      .orderBy('menu.sortCode')
      .addOrderBy('children.sortCode')
      .getMany();

      permissionList = await this.menuRepository
      .createQueryBuilder('menu')
      .select(['menu.id', 'menu.fullName'])
      .leftJoinAndSelect('menu.buttons', 'button')
      .leftJoinAndSelect('menu.columns', 'column')
      .where('menu.enabledMark = 1')
      .getMany();

      classList = await this.classRepository
      .createQueryBuilder('class')
      .select(['class.id', 'class.fullName'])
      .getMany()
    } else {
      const flatMenus = await this.menuRepository
      .createQueryBuilder('menu')
      .innerJoin('role_menu_relation', 'rmr', 'rmr.menuId = menu.id')
      .innerJoin('user_role_relation', 'urr', 'urr.roleId = rmr.roleId')
      .where('urr.userId = :userId', { userId })
      .andWhere('menu.enabledMark = 1')
      .orderBy('menu.sortCode')
      .getMany();

      menus = this.buildMenuTree(flatMenus)

      permissionList = await this.menuRepository
      .createQueryBuilder('menu')
      .select(['menu.id', 'menu.fullName'])
      .innerJoin('role_menu_relation', 'rmr', 'rmr.menuId = menu.id')
      .innerJoin('user_role_relation', 'urr', 'urr.roleId = rmr.roleId')
      .leftJoin('role_button_relation', 'rbr', 'urr.roleId = rbr.roleId')
      .leftJoin('role_column_relation', 'rcr', 'urr.roleId = rcr.roleId')
      .leftJoinAndSelect('menu.buttons', 'button', 'rbr.buttonPermissionId = button.id')
      .leftJoinAndSelect('menu.columns', 'column', 'rcr.columnPermissionId = column.id')
      .where('urr.userId = :userId', { userId })
      .andWhere('menu.enabledMark = 1')
      .getMany();

      classList = await this.classRepository
      .createQueryBuilder('class')
      .select(['class.id', 'class.fullName'])
      .innerJoin('role_class_relation', 'rcr', 'rcr.billClassId = class.id')
      .innerJoin('user_role_relation', 'urr', 'urr.roleId = rcr.roleId')
      .where('urr.userId = :userId', { userId })
      .getMany()
    }
    
    return {
      menuList: menus,
      permissionList: permissionList,
      classList
    }
    
  }

  // 获取用户权限（权限守卫用）
  async getUserPermissions(userId: string) {
    return await this.menuRepository
    .createQueryBuilder('menu')
    .select(['menu.id', 'menu.entityCode'])
    .innerJoin('role_menu_relation', 'rmr', 'rmr.menuId = menu.id')
    .innerJoin('user_role_relation', 'urr', 'urr.roleId = rmr.roleId')
    .leftJoin('role_button_relation', 'rbr', 'urr.roleId = rbr.roleId')
    .leftJoinAndSelect('menu.buttons', 'button', 'rbr.buttonPermissionId = button.id')
    .where('urr.userId = :userId', { userId })
    .andWhere('menu.enabledMark = 1')
    .getMany();
  }
}
