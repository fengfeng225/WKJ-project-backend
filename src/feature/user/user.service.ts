import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { Menu } from '../menu/entities/menu.entity';
import { Button_permission } from 'src/entities/button_permission.entity';
import { Column_permission } from 'src/entities/column_permission.entity';

@Injectable()
export class UserService {
  // 注入 一个操作数据表
  constructor(
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,
    @InjectRepository(Menu)
    private readonly menuRepository:Repository<Menu>,
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

  async getPermissionListByUserId(userId:number) {

    const menus = await this.menuRepository
    .createQueryBuilder('menu')
    .innerJoin('role_menu_relation', 'rmr', 'rmr.menuId = menu.id')
    .innerJoin('user_role_relation', 'urr', 'urr.roleId = rmr.roleId')
    .where('urr.userId = :userId', { userId })
    .leftJoinAndSelect('menu.children', 'children')
    .andWhere('menu.parentId IS NULL')
    .getMany();
    
    
    return {
      menuList: [],
      permissionList: []
    }
    
  }

  // 添加测试数据
  async initData() {

    // 用户
    const user0 = new User()
    user0.account = 'admin'
    user0.username = '管理员'

    const user1 = new User()
    user1.account = 'by_one_class'
    user1.username = '白油一班'

    const user2 = new User()
    user2.account = 'by_two_class'
    user2.username = '白油二班'

    // 角色
    const role1 = new Role()
    role1.fullName = '角色1'
    role1.entityCode = 'role1'

    const role2 = new Role()
    role2.fullName = '角色2'
    role2.entityCode = 'role2'

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

    // 菜单自身绑定
    menu1.children = [menu2]
    menu3.children = [menu4, menu5, menu6]
    menu7.children = [menu8]

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
    role1.menus = [menu7, menu8, menu3, menu4, menu5, menu6]
    role2.menus = [menu3, menu4, menu5, menu6]

    role1.buttons = [button1, button2]
    role2.buttons = [button3]

    role1.columns = [column1, column2]

    // 用户绑定角色
    user1.roles = [role1, role2]
    user2.roles = [role2]

    await this.userRepository.save([user1, user2])
  }


}
