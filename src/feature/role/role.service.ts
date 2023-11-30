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
        buttons: true,
        columns: true,
        menus: true,
        users: true
      }
    })

    // 如果找不到该 Role，抛出异常
    if (!role) {
      throw new NotFoundException('没有找到角色');
    }

    // 开启事务
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      // 解除与 Button 的关联关系
      await this.removeRoleFromButtons(role.buttons, id, transactionalEntityManager);

      // 解除与 Column 的关联关系
      // await this.removeRoleFromColumns(role.columns, id, transactionalEntityManager);

      // 解除与 Menu 的关联关系
      // await this.removeRoleFromMenus(role.menus, id, transactionalEntityManager);

      // 解除与 User 的关联关系
      // await this.removeRoleFromUsers(role.users, id, transactionalEntityManager);

      // 删除 Role 对象
      await transactionalEntityManager.remove(Role, role);
    })

    return null
  }

  // 权限
  async findAllAuthorize(id: number, findRoleAuthorizeDto: FindRoleAuthorizeDto) {
    
  }

  async updateAuthorize(id: number, updateRoleAuthorizeDto: UpdateRoleAuthorizeDto) {

  }

  // 解除与Button的关联
  private async removeRoleFromButtons(buttons: Button_permission[], roleId: number, manager): Promise<void> {
    for (const button of buttons) {
      button.roles = button.roles.filter(role => role.id !== roleId);
      await manager.save(Button_permission, button);
    }
  }
}
