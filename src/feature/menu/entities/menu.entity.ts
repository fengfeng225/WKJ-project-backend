import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  ManyToMany
} from 'typeorm';
import { Button_permission } from 'src/feature/button/entities/button_permission.entity';
import { Column_permission } from 'src/feature/column/entities/column_permission.entity';
import { Role } from '../../role/entities/role.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn({ comment: '自然主键' })
  id: number;

  @Column({
    type: 'int',
    comment: '菜单类型'
  })
  type: number;

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
    length: 50,
    comment: '图标'
  })
  icon: string;

  @Column({
    nullable: true,
    type: 'longtext',
    comment: '地址'
  })
  urlAddress: string;

  @Column({
    type: 'int',
    default: 1,
    comment: '启用状态'
  })
  enabledMark: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '表示删除'
  })
  deleteMark: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '排序'
  })
  sortCode: number;

  @Column({
    type: 'text',
    nullable: true,
    comment: '说明'
  })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', select: false, comment: '创建时间' })
  creatorTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', onUpdate: 'CURRENT_TIMESTAMP(0)', select: false, comment: '上次更新时间' })
  lastModifyTime: Date;

  @Column({ nullable: true, comment: '父级的ID' })
  parentId: number;

  @ManyToOne(() => Menu, menu => menu.children)
  parent: Menu;

  @OneToMany(() => Menu, menu => menu.parent)
  children: Menu[];

  @OneToMany(() => Button_permission, (button) => button.menu)
  buttons: Button_permission[]

  @OneToMany(() => Column_permission, (column) => column.menu)
  columns: Column_permission[]

  @ManyToMany(() => Role, (role) => role.menus)
  @JoinTable({
    name: 'role_menu_relation'
  })
  roles: Role[];
}
