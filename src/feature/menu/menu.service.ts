import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not  } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { Button_permission } from '../button/entities/button_permission.entity';
import { Column_permission } from '../column/entities/column_permission.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository:Repository<Menu>,
    private dataSource: DataSource
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

  async create(createMenuDto: CreateMenuDto) {    
    const isExist = await this.menuRepository.findOne({
      where: [
        { fullName: createMenuDto.fullName },
        { entityCode: createMenuDto.entityCode }
      ]
    })    

    if (isExist) throw new ConflictException('名称或编码重复')

    if (createMenuDto.parentId === '-1') createMenuDto.parentId = null
    
    await this.menuRepository.save(createMenuDto)

    return null
  }

  async findAll(keyword) {
    const flatMenus = await this.dataSource.query(
      `
      select * from menu where menu.fullName like '%${keyword}%'
      UNION
      select * from menu m where m.parentId in(select menu.id from menu where menu.fullName like '%${keyword}%' and menu.parentId is null)
      UNION
      select * from menu m where m.id in(select menu.parentId from menu where menu.fullName like '%${keyword}%' and menu.parentId is not null) order by sortCode
      `
    )
    
    const menus = this.buildMenuTree(flatMenus)
    return {
      list: menus
    }
  }

  async getSelector(id: string) {
    const menus = await this.menuRepository
    .createQueryBuilder('menu')
    .orderBy("menu.sortCode")
    .where('menu.type = 1')
    .andWhere('menu.id != :id', {id})
    .getMany();

    return {
      list: menus
    }
  }

  async findOne(id: string) {
    return await this.menuRepository.findOne({
      where: {
        id
      }
    })
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {    
    const menu = await this.menuRepository.findOne({
      where: {
        id
      }
    })

    if (!menu) throw new NotFoundException('没有找到菜单')

    const isExist = await this.menuRepository.findOne({
      where: [
        { fullName: updateMenuDto.fullName, id: Not(updateMenuDto.id) },
        { entityCode: updateMenuDto.entityCode, id: Not(updateMenuDto.id) }
      ]
    })

    if (isExist) throw new ConflictException('名称或编码重复')
    
    await this.menuRepository.save(updateMenuDto)
    return null
  }

  async remove(id: string) {
    const hasChildren = await this.menuRepository.findOne({
      where: {
        parentId: id
      }
    })

    if (hasChildren) throw new ConflictException('该目录下还存在页面，不允许删除')

    // 查找要删除的 Menu 对象
    const menu = await this.menuRepository.findOne({
      where: {
        id
      },
      relations: {
        buttons: true,
        columns: true,
        roles: true
      }
    })

    // 如果找不到该 Menu，抛出异常
    if (!menu) throw new NotFoundException('没有找到菜单');

    // 开启事务
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      // 删除关联的 Button 对象
      await this.deleteAssociatedButtons(menu.buttons, transactionalEntityManager);

      // 删除关联的 Column 对象
      await this.deleteAssociatedColumns(menu.columns, transactionalEntityManager);

      // 删除 Menu 对象
      await transactionalEntityManager.remove(menu);
    })

    return null
  }

  // 删除关联的button
  private async deleteAssociatedButtons(buttons: Button_permission[], manager): Promise<void> {
    for (const button of buttons) {
      await manager.remove(button);
    }
  }

  // 删除关联的column
  private async deleteAssociatedColumns(columns: Column_permission[], manager): Promise<void> {
    for (const column of columns) {
      await manager.remove(column);
    }
  }
}
