import {
  Column,
  Entity,
  ManyToMany,
  PrimaryColumn,
  JoinTable,
  BeforeInsert
} from 'typeorm';
import util from 'src/utils/util';
import { User } from '../../user/entities/user.entity';
import { Menu } from '../../menu/entities/menu.entity';
import { Button_permission } from 'src/feature/button/entities/button_permission.entity';
import { Column_permission } from 'src/feature/column/entities/column_permission.entity';

@Entity()
export class Role {
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
    type: 'text',
    nullable: true,
    comment: '说明'
  })
  description: string;

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

  @ManyToMany(() => User, {cascade: true})
  @JoinTable({
      name: 'user_role_relation'
  })
  users: User[];

  @ManyToMany(() => Menu, {cascade: true})
  @JoinTable({
    name: 'role_menu_relation'
  })
  menus: Menu[];

  @ManyToMany(() => Button_permission, {cascade: true})
  @JoinTable({
    name: 'role_button_relation'
  })
  buttons: Button_permission[];

  @ManyToMany(() => Column_permission, {cascade: true})
  @JoinTable({
    name: 'role_column_relation'
  })
  columns: Column_permission[];
}
