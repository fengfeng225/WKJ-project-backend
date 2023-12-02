import {
  Column,
  Entity,
  PrimaryColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  BeforeInsert
} from 'typeorm';
import util from 'src/utils/util';
import { Menu } from '../../menu/entities/menu.entity';
import { Role } from '../../role/entities/role.entity';

@Entity()
export class Column_permission {
  @PrimaryColumn({ comment: '自然主键', length: 20, unique: true })
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = util.generateUniqueId();
  }

  @Column({
    length: 50,
    comment: '名称'
  })
  fullName: string;

  @Column({
    length: 50,
    comment: '编码'
  })
  entityCode: string;

  @Column({
    type: 'int',
    default: 1,
    comment: '启用状态'
  })
  enabledMark: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '排序'
  })
  sortCode: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', select: false, comment: '创建时间' })
  creatorTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', onUpdate: 'CURRENT_TIMESTAMP(0)', select: false, comment: '上次更新时间' })
  lastModifyTime: Date;

  @ManyToOne(() => Menu, (menu) => menu.columns)
  menu: Menu

  @Column({comment: '所属菜单ID'})
  menuId: string

  @ManyToMany(() => Role, {cascade: true})
  @JoinTable({
    name: 'role_column_relation'
  })
  roles: Role[];
}
