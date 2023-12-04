import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MbLong } from '../bill/mb/entities/mb-long.entity';
import { MbShort } from '../bill/mb/entities/mb-short.entity';
import { Menu } from '../menu/entities/menu.entity';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(MbLong)
    private readonly longRepository:Repository<MbLong>,
    @InjectRepository(MbShort)
    private readonly shortRepository:Repository<MbShort>,
    @InjectRepository(Menu)
    private readonly menuRepository:Repository<Menu>,
  ){}

  private async getUserMenus(id: string, account: string): Promise<Menu[]> {
    if (account === 'admin') {
      return await this.menuRepository
      .createQueryBuilder('menu')
      .select('menu.entityCode')
      .where('menu.enabledMark = 1')
      .getMany();
    }
    return await this.menuRepository
    .createQueryBuilder('menu')
    .select('menu.entityCode')
    .innerJoin('role_menu_relation', 'rmr', 'rmr.menuId = menu.id')
    .innerJoin('user_role_relation', 'urr', 'urr.roleId = rmr.roleId')
    .where('urr.userId = :id', { id })
    .andWhere('menu.enabledMark = 1')
    .getMany();
  }

  async findAll(id: string, account: string) {
    const menus = await this.getUserMenus(id, account)
    const menusEntityCode = menus.map(menu => menu.entityCode)
    const data: { [key: string]: any } = {}

    if (menusEntityCode.includes('shortBill')) {
      data.totalShort = await this.shortRepository.count()
    }

    if (menusEntityCode.includes('longBill')) {
      data.totalLong = await this.longRepository.count()
    }
    
    return data
  }
}
