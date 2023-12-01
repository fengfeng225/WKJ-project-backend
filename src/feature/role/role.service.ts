import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, DataSource } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindRoleAuthorizeDto } from './dto/find-roleAuthorize.dto';
import { UpdateRoleAuthorizeDto } from './dto/update-roleAuthorize.dto';
import { Role } from './entities/role.entity';
import { Menu } from '../menu/entities/menu.entity';
import { Button_permission } from '../button/entities/button_permission.entity';
import { Column_permission } from '../column/entities/column_permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository:Repository<Role>,
    @InjectRepository(Menu)
    private readonly menuRepository:Repository<Menu>,
    @InjectRepository(Button_permission)
    private readonly buttonRepository:Repository<Button_permission>,
    @InjectRepository(Column_permission)
    private readonly columnRepository:Repository<Column_permission>,
    private readonly dataSource: DataSource
  ){}

  async create(createRoleDto: CreateRoleDto) {
    const isExist = await this.roleRepository.findOne({
      where: [
        { fullName: createRoleDto.fullName },
        { entityCode: createRoleDto.entityCode }
      ]
    })
    
    if (isExist) throw new ConflictException('名称或编码重复')
    const entity = this.roleRepository.create(createRoleDto)
    await this.roleRepository.save(entity)
    return null
  }

  async findAll(keyword: string) {
    const query = this.roleRepository.createQueryBuilder('role')

    if (keyword) query.where(`fullName LIKE :keyword`, { keyword: `%${keyword}%` })

    const list = await query.getMany()

    return {
      list
    }
  }

  async findOne(id: string) {
    return await this.roleRepository.findOne({
      where: {
        id
      }
    })
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({
      where: {
        id
      }
    })

    if (!role) throw new NotFoundException('没有找到角色')

    const isExist = await this.roleRepository.findOne({
      where: [
        { fullName: updateRoleDto.fullName, id: Not(updateRoleDto.id) },
        { entityCode: updateRoleDto.entityCode, id: Not(updateRoleDto.id) }
      ]
    })

    if (isExist) throw new ConflictException('名称或编码重复')
    
    await this.roleRepository.save(updateRoleDto)
    return null
  }

  async remove(id: string) {
    // 查找要删除的 Role 对象
    const role = await this.roleRepository.findOne({
      where: {
        id
      }
    })
    
    // 如果找不到该 Role，抛出异常
    if (!role) throw new NotFoundException('没有找到角色');

    await this.roleRepository.remove(role)

    return null
  }

  // 获取角色拥有的权限
  async findAllAuthorize(roleId: string, findRoleAuthorizeDto: FindRoleAuthorizeDto) {
    let list: Menu[], ids: Menu[] | Button_permission[] | Column_permission[], all
    const { type, menuIds } = findRoleAuthorizeDto
    const menuIdsToArray = menuIds.split(',')

    switch (type) {
      case 'menu':
        list = await this.menuRepository
        .createQueryBuilder('menu')
        .where('menu.parentId IS NULL')
        .leftJoinAndSelect('menu.children', 'children')
        .getMany()

        ids = await this.menuRepository
        .createQueryBuilder('menu')
        .select('menu.id')
        .innerJoin('role_menu_relation', 'rmr', 'rmr.menuId = menu.id')
        .where('rmr.roleId = :roleId', {roleId})
        .getMany()

        all = await this.menuRepository
        .createQueryBuilder('menu')
        .select('menu.id')
        .getMany()
        break;
      case 'button':
        const menusInButtonPage = await this.menuRepository
        .createQueryBuilder('menu')
        .where('menu.id in (:...menuIdsToArray)', {menuIdsToArray})
        .getMany()
        const buttons = await this.buttonRepository
        .createQueryBuilder('button')
        .where('button.menuId in (:...menuIdsToArray)', {menuIdsToArray})
        .getMany()

        const menuButtonTree = this.mergeButtonColumnAndMenu(menusInButtonPage, buttons)
        list = this.buildMenuTree(menuButtonTree)

        ids = await this.buttonRepository
        .createQueryBuilder('button')
        .select('button.id')
        .leftJoin('role_button_relation', 'rbr', 'rbr.buttonPermissionId = button.id')
        .where('rbr.roleId = :roleId', {roleId})
        .andWhere('button.menuId in (:...menuIdsToArray)', {menuIdsToArray})
        .getMany()

        all = menuButtonTree.map(menu => {return {id: menu.id}}).concat(buttons.map(button => {return {id: button.id}}))
        
        break;
      case 'column':
        const menusInColumnPage = await this.menuRepository
        .createQueryBuilder('menu')
        .where('menu.id in (:...menuIdsToArray)', {menuIdsToArray})
        .getMany()
        const columns = await this.columnRepository
        .createQueryBuilder('column')
        .where('column.menuId in (:...menuIdsToArray)', {menuIdsToArray})
        .getMany()

        const menuColumnTree = this.mergeButtonColumnAndMenu(menusInColumnPage, columns)
        list = this.buildMenuTree(menuColumnTree)

        ids = await this.columnRepository
        .createQueryBuilder('column')
        .select('column.id')
        .leftJoin('role_column_relation', 'rcr', 'rcr.columnPermissionId = column.id')
        .where('rcr.roleId = :roleId', {roleId})
        .andWhere('column.menuId in (:...menuIdsToArray)', {menuIdsToArray})
        .getMany()

        all = menuColumnTree.map(menu => {return {id: menu.id}}).concat(columns.map(column => {return {id: column.id}}))
        break;
      default:
        break;
    }

    return {
      list,
      ids: ids.map(item => item.id),
      all: all.map(item => item.id)
    }
  }

  // 更新角色权限
  async updateAuthorize(id: string, updateRoleAuthorizeDto: UpdateRoleAuthorizeDto) {
    const { menus, buttons, columns } = updateRoleAuthorizeDto
    const role = await this.roleRepository.findOne({
      where: {
        id
      }
    })

    if (!role) throw new NotFoundException('没有找到角色');

    const newMenus = await this.menuRepository
    .createQueryBuilder('menu')
    .where('menu.id in (:...menus)', {menus})
    .getMany()
    const newButtons = await this.buttonRepository
    .createQueryBuilder('button')
    .where('button.id in (:...buttons)', {buttons})
    .getMany()
    const newColumns = await this.columnRepository
    .createQueryBuilder('column')
    .where('column.id in (:...columns)', {columns})
    .getMany()    

    role.menus = newMenus
    role.buttons = newButtons
    role.columns = newColumns
    await this.roleRepository.save(role)

    return null
  }

  private mergeButtonColumnAndMenu(menus, children: Button_permission[] | Column_permission[]): Menu[] {
    const cloneMenus = JSON.parse(JSON.stringify(menus))
    for (const child of children) {
      const actionMenu = cloneMenus.find(menu => menu.id === child.menuId);
      (actionMenu.children ??= []).push(child)
    }
    const menuChildren = cloneMenus.filter(menu => menu.children && menu.children.length > 0)
    const parentIds = menuChildren.map(menu => menu.parentId)
    const menuParent = cloneMenus.filter(menu => parentIds.includes(menu.id))
    return menuChildren.concat(menuParent)
  }

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
}
