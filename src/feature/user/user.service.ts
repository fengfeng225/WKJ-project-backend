import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { User } from './entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { Menu } from '../menu/entities/menu.entity';
import { Button_permission } from 'src/feature/button/entities/button_permission.entity';
import { Column_permission } from 'src/feature/column/entities/column_permission.entity';
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

    const roles = await this.roleRepository
    .createQueryBuilder('role')
    .where('role.id in (:...roleId)', {roleId: createUserDto.roleId})
    .getMany()

    const entity = this.userRepository.create(createUserDto)
    entity.roles = roles
    await this.userRepository.save(entity)
    return null
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        id
      }
    })

    if (!user) throw new NotFoundException('没有找到用户') 

    const isExist = await this.userRepository.findOne({
      where: [
        { account: updateUserDto.account, id: Not(updateUserDto.id) },
        { userName: updateUserDto.userName, id: Not(updateUserDto.id) }
      ]
    })

    if (isExist) throw new ConflictException('名称或编码重复')

    const roles = await this.roleRepository
    .createQueryBuilder('role')
    .where('role.id in (:...roleId)', {roleId: updateUserDto.roleId})
    .getMany()
    
    const entity = this.userRepository.create(updateUserDto)
    entity.roles = roles
    await this.userRepository.save(entity)
    return null
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id
      }
    })
    
    if (!user) throw new NotFoundException('没有找到用户');

    await this.userRepository.softRemove(user)

    return null
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
    
    return null
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
    
    return null
  }

  // 获取用户权限（返回给前端）
  async getPermissionListByUserId(userId: string, account: string) {
    let menus, permissionList

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
    }
    
    return {
      menuList: menus,
      permissionList: permissionList
    }
    
  }

  // 获取用户权限（权限守卫用）
  async getUserPermissions(userId: string) {
    const menus = await this.menuRepository
    .createQueryBuilder('menu')
    .select(['menu.id', 'menu.entityCode'])
    .innerJoin('role_menu_relation', 'rmr', 'rmr.menuId = menu.id')
    .innerJoin('user_role_relation', 'urr', 'urr.roleId = rmr.roleId')
    .where('urr.userId = :userId', { userId })
    .andWhere('menu.enabledMark = 1')
    .getMany();

    const buttons = await this.menuRepository
    .createQueryBuilder('menu')
    .select(['menu.id', 'menu.entityCode'])
    .innerJoin('role_menu_relation', 'rmr', 'rmr.menuId = menu.id')
    .innerJoin('user_role_relation', 'urr', 'urr.roleId = rmr.roleId')
    .leftJoin('role_button_relation', 'rbr', 'urr.roleId = rbr.roleId')
    .leftJoinAndSelect('menu.buttons', 'button', 'rbr.buttonPermissionId = button.id')
    .where('urr.userId = :userId', { userId })
    .andWhere('menu.enabledMark = 1')
    .getMany();

    return { menus, buttons }
  }

  // 添加测试数据
  async initData() {

    // 用户
    const user0 = new User()
    user0.account = 'admin'
    user0.userName = '管理员'

    const user1 = new User()
    user1.account = 'by_one_class'
    user1.userName = '白油一班'

    const user2 = new User()
    user2.account = 'by_two_class'
    user2.userName = '白油二班'

    // 角色
    const role1 = new Role()
    role1.fullName = '角色1'
    role1.entityCode = 'role1'

    const role2 = new Role()
    role2.fullName = '角色2'
    role2.entityCode = 'role2'

    const role3 = new Role()
    role3.fullName = '角色3'
    role3.entityCode = 'role3'

    // 菜单
    const menu1 = new Menu()
    menu1.fullName = '系统管理'
    menu1.entityCode = 'system'
    menu1.icon = 'el-icon-setting'
    menu1.type = 1

    const menu2 = new Menu()
    menu2.fullName = '选项字段'
    menu2.entityCode = 'optionsConfig'
    menu2.icon = 'icon-ym icon-ym-options'
    menu2.urlAddress = 'system/optionsConfig'
    menu2.type = 2

    const menu3 = new Menu()
    menu3.fullName = '权限管理'
    menu3.entityCode = 'permission'
    menu3.icon = 'icon-ym icon-ym-permission'
    menu3.type = 1

    const menu4 = new Menu()
    menu4.fullName = '菜单管理'
    menu4.entityCode = 'menu'
    menu4.icon = 'el-icon-menu'
    menu4.urlAddress = 'permission/menu'
    menu4.type = 2

    const menu5 = new Menu()
    menu5.fullName = '角色管理'
    menu5.entityCode = 'role'
    menu5.icon = 'icon-ym icon-ym-role'
    menu5.urlAddress = 'permission/role'
    menu5.type = 2

    const menu6 = new Menu()
    menu6.fullName = '用户管理'
    menu6.entityCode = 'user'
    menu6.icon = 'icon-ym icon-ym-user'
    menu6.urlAddress = 'permission/user'
    menu6.type = 2

    const menu7 = new Menu()
    menu7.fullName = '盲板管理'
    menu7.entityCode = 'bill/mb'
    menu7.icon = 'el-icon-folder'
    menu7.type = 1

    const menu8 = new Menu()
    menu8.fullName = '短期台账'
    menu8.entityCode = 'shortBill'
    menu8.icon = 'el-icon-document'
    menu8.urlAddress = 'bill/mb/shortBill'
    menu8.type = 2

    const menu9 = new Menu()
    menu9.fullName = '系统图标'
    menu9.entityCode = 'icon'
    menu9.icon = 'icon-ym icon-ym-sysIcon'
    menu9.urlAddress = 'system/icon'
    menu9.type = 2

    const menu10 = new Menu()
    menu10.fullName = '系统日志'
    menu10.entityCode = 'log'
    menu10.icon = 'el-icon-tickets'
    menu10.urlAddress = 'system/log'
    menu10.type = 2

    const menu11 = new Menu()
    menu11.fullName = '长期台账'
    menu11.entityCode = 'longBill'
    menu11.icon = 'el-icon-document-copy'
    menu11.urlAddress = 'bill/mb/longBill'
    menu11.type = 2

    const menu12 = new Menu()
    menu12.fullName = '拆装明细'
    menu12.entityCode = 'disassemblyDetails'
    menu12.icon = 'el-icon-notebook-2'
    menu12.urlAddress = 'bill/mb/disassemblyDetails'
    menu12.type = 2

    const menu13 = new Menu()
    menu13.fullName = '班组'
    menu13.entityCode = 'groups'
    menu13.icon = 'ym-custom ym-custom-format-list-bulleted'
    menu13.urlAddress = 'bill/mb/groups'
    menu13.type = 2

    const menu14 = new Menu()
    menu14.fullName = '定时任务'
    menu14.entityCode = 'scheduledTask'
    menu14.icon = 'icon-ym icon-ym-sysQuartz'
    menu14.type = 1

    const menu15 = new Menu()
    menu15.fullName = '检查计划'
    menu15.entityCode = 'checkPlan'
    menu15.icon = 'ym-custom ym-custom-calendar-check'
    menu15.urlAddress = 'scheduledTask/checkPlan'
    menu15.type = 2

    // 菜单自身绑定
    menu1.children = [menu2, menu9, menu10]
    menu3.children = [menu4, menu5, menu6]
    menu7.children = [menu8, menu11, menu12, menu13]
    menu14.children = [menu15]

    // 按钮
    const button1 = new Button_permission()
    button1.fullName = 'Add'
    button1.entityCode = 'btn_add'

    const button2 = new Button_permission()
    button2.fullName = 'Edit'
    button2.entityCode = 'btn_edit'

    const button3 = new Button_permission()
    button3.fullName = 'Add'
    button3.entityCode = 'btn_add'

    // 列
    const column1 = new Column_permission()
    column1.fullName = 'Name'
    column1.entityCode = 'name'

    const column2 = new Column_permission()
    column2.fullName = 'Code'
    column2.entityCode = 'code'

    // 菜单绑定按钮和列
    menu8.columns = [column1, column2]
    menu8.buttons = [button1, button2]
    menu6.buttons = [button3]

    // 角色绑定权限
    role1.menus = [menu7, menu8, menu3, menu4, menu5, menu6, menu14, menu15]
    role2.menus = [menu3, menu4, menu5, menu6]
    role3.menus = [menu8, menu1, menu2, menu9, menu10, menu11, menu12, menu13]

    role1.buttons = [button1]
    role2.buttons = [button3]
    role3.buttons = [button2]

    role1.columns = [column1, column2]

    // 用户绑定角色
    user1.roles = [role1, role2]
    user2.roles = [role2, role3]

    await this.userRepository.save([user0, user1, user2])
  }
}
