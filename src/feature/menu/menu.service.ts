import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Not  } from 'typeorm';
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

  async create(createMenuDto: CreateMenuDto) {    
    const isExist = await this.menuRepository.findOne({
      where: [
        { fullName: createMenuDto.fullName },
        { entityCode: createMenuDto.entityCode }
      ]
    })    

    if (isExist) throw new ConflictException('名称或编码重复')

    if (createMenuDto.parentId === '-1') createMenuDto.parentId = null
    
    const entity = this.menuRepository.create(createMenuDto)
    await this.menuRepository.save(entity)
  }

  async findAll(keyword: string) {
    const menus = await this.menuRepository
    .createQueryBuilder('menu')
    .leftJoinAndSelect('menu.children', 'children')
    .where('menu.parentId IS NULL')
    .andWhere('menu.fullName LIKE :keyword OR children.fullName LIKE :keyword', {keyword: `%${keyword}%`})
    .orderBy('menu.sortCode')
    .addOrderBy('children.sortCode')
    .getMany()

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
    const menu = await this.menuRepository.findOne({
      where: {
        id
      }
    })
    if (!menu) throw new NotFoundException('没有找到菜单信息')
    return menu
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {    
    const menu = await this.menuRepository.findOne({
      where: {
        id
      }
    })

    if (!menu) throw new NotFoundException('没有找到菜单信息')

    const isExist = await this.menuRepository.findOne({
      where: [
        { fullName: updateMenuDto.fullName, id: Not(updateMenuDto.id) },
        { entityCode: updateMenuDto.entityCode, id: Not(updateMenuDto.id) }
      ]
    })

    if (isExist) throw new ConflictException('名称或编码重复')
    
    await this.menuRepository.save(updateMenuDto)
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
        columns: true
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
  }

  // 删除关联的button
  private async deleteAssociatedButtons(buttons: Button_permission[], manager: EntityManager): Promise<void> {    
    for (const button of buttons) {
      await manager.remove(button);
    }
  }

  // 删除关联的column
  private async deleteAssociatedColumns(columns: Column_permission[], manager: EntityManager): Promise<void> {
    for (const column of columns) {
      await manager.remove(column);
    }
  }
}
