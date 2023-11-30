import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, DataSource } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindRoleAuthorizeDto } from './dto/find-roleAuthorize.dto';
import { UpdateRoleAuthorizeDto } from './dto/update-roleAuthorize.dto';
import { Role } from './entities/role.entity';
import { User } from '../user/entities/user.entity';
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
    private dataSource: DataSource
  ){}

  async create(createRoleDto: CreateRoleDto) {
    const isExist = await this.roleRepository.findOne({
      where: [
        { fullName: createRoleDto.fullName },
        { entityCode: createRoleDto.entityCode }
      ]
    })

    if (isExist) throw new ConflictException('名称或编码重复')

    await this.roleRepository.save(createRoleDto)
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

  async findOne(id: number) {
    return await this.roleRepository.findOne({
      where: {
        id
      }
    })
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
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

  async remove(id: number) {
    // 查找要删除的 Role 对象
    const role = await this.roleRepository.findOne({
      where: {
        id
      },
      relations: {
        menus: true
      }
    })

    // 如果找不到该 Role，抛出异常
    if (!role) throw new NotFoundException('没有找到角色');

    // 开启事务
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      
      // 删除角色
      await transactionalEntityManager.remove(role)
    })

    return null
  }

  // 权限
  async findAllAuthorize(roleId: number, findRoleAuthorizeDto: FindRoleAuthorizeDto) {
    let list: Menu[], ids: Menu[] | Button_permission[] | Column_permission[], all: Menu[]
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
        list = await this.menuRepository
        .createQueryBuilder('menu')
        .where('menu.id in (:...menuIdsToArray)', {menuIdsToArray})
        .leftJoinAndSelect('menu.buttons', 'buttons')
        .leftJoinAndSelect('menu.children', 'children')
        .andWhere('children.id in (:...menuIdsToArray)', {menuIdsToArray})
        .getMany()

        ids = await this.buttonRepository
        .createQueryBuilder('button')
        .select('button.id')
        .leftJoin('role_button_relation', 'rbr', 'rbr.buttonPermissionId = button.id')
        .where('rbr.roleId = :roleId', {roleId})
        .andWhere('button.menuId in (:...menuIdsToArray)', {menuIdsToArray})
        .getMany()

        all = await this.menuRepository
        .createQueryBuilder('menu')
        .select('menu.id')
        .leftJoin('menu.buttons', 'buttons')
        .addSelect('buttons.id')
        .leftJoinAndSelect('menu.children', 'children')
        .addSelect('children.id')
        .where('menu.id IN (:...menuIdsToArray)', { menuIdsToArray })
        .andWhere('children.id IN (:...menuIdsToArray)', { menuIdsToArray })
        .getMany()
        break;
      case 'column':

        break;
      default:
        break;
    }

    return {
      list,
      ids,
      all
    }
  }

  async updateAuthorize(id: number, updateRoleAuthorizeDto: UpdateRoleAuthorizeDto) {

  }
}
