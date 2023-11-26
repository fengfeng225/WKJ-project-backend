import { Injectable, HttpException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not  } from 'typeorm';
import { Menu } from './entities/menu.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository:Repository<Menu>,
    private dataSource: DataSource
  ){}

  private buildMenuTree(flatMenus: Menu[]): Menu[] {
    const menuMap = new Map<number, Menu>();
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
        { fullName: createMenuDto.fullName, deleteMark: 0 },
        { entityCode: createMenuDto.entityCode, deleteMark: 0 }
      ]
    })    

    if (isExist) throw new HttpException('名称或编码重复', 400)

    await this.menuRepository.save(createMenuDto)

    return null
  }

  async findAll(query) {
    const flatMenus = await this.dataSource.query(
      `
      select * from menu where menu.fullName like '%${query.keyword}%' and menu.deleteMark = 0
      UNION
      select * from menu m where m.parentId in(select menu.id from menu where menu.fullName like '%${query.keyword}%' and menu.deleteMark = 0 and menu.parentId is null) and m.deleteMark = 0
      UNION
      select * from menu m where m.id in(select menu.parentId from menu where menu.fullName like '%${query.keyword}%' and menu.deleteMark = 0 and menu.parentId is not null) and m.deleteMark = 0
      `
    )
    
    const menus = this.buildMenuTree(flatMenus)
    return {
      list: menus
    }
  }

  async getSelector(id: number) {
    const menus = await this.menuRepository
    .createQueryBuilder('menu')
    .where('menu.type = 1')
    .andWhere('menu.deleteMark = 0')
    .andWhere('menu.id != :id', {id})
    .getMany();

    return {
      list: menus
    }
  }

  async findOne(id: number) {
    return await this.menuRepository.findOne({
      where: {
        id
      }
    })
  }

  async update(id: number, updateMenuDto: UpdateMenuDto) {    
    const menu = await this.menuRepository.findOne({
      where: {
        id
      }
    })

    if (!menu) throw new HttpException('无效的菜单', 500)

    const isExist = await this.menuRepository.findOne({
      where: [
        { fullName: updateMenuDto.fullName, deleteMark: 0, id: Not(updateMenuDto.id) },
        { entityCode: updateMenuDto.entityCode, deleteMark: 0, id: Not(updateMenuDto.id) }
      ]
    })

    if (isExist) throw new HttpException('名称或编码重复', 400)
    
    await this.menuRepository.save(updateMenuDto)
    return null
  }

  async remove(id: number) {
    const hasChildren = await this.menuRepository.findOne({
      where: {
        parentId: id,
        deleteMark: 0
      }
    })

    if (hasChildren) throw new HttpException('该目录下还存在页面，不允许删除', 400)

    const result = await this.menuRepository
    .createQueryBuilder('menu')
    .update()
    .set({deleteMark: 1})
    .where("id = :id", { id })
    .execute()

    if (result.affected === 1) return null
  }
}
