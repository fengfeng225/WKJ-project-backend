import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Timestamp,
  JoinTable
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Menu } from '../../menu/entities/menu.entity';
import { Button_permission } from 'src/entities/button_permission.entity';
import { Column_permission } from 'src/entities/column_permission.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    length: 50
  })
  fullName: string;

  @Column({
    unique: true,
    length: 50
  })
  entityCode: string;

  @Column({
    nullable: true
  })
  description: string;

  @Column({
    default: 1
  })
  enabledMark: number;

  @Column({
    nullable: true
  })
  sortCode: number;

  @CreateDateColumn({
    type: 'timestamp'
  })
  creatorTime: Timestamp;

  @UpdateDateColumn({
      type: 'timestamp'
  })
  lastModifyTime: Timestamp;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Menu, (menu) => menu.roles)
  @JoinTable({
    name: 'role_menu_relation'
  })
  menus: Menu[];

  @ManyToMany(() => Button_permission, (button) => button.roles)
  @JoinTable({
    name: 'role_button_relation'
  })
  buttons: Button_permission[];

  @ManyToMany(() => Column_permission, (column) => column.roles)
  @JoinTable({
    name: 'role_column_relation'
  })
  columns: Column_permission[];
}
