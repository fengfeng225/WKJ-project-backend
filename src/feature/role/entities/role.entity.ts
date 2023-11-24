import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
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
    type: 'text',
    nullable: true
  })
  description: string;

  @Column({
    type: 'int',
    default: 1
  })
  enabledMark: number;

  @Column({
    type: 'int',
    nullable: true
  })
  sortCode: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)' })
  creatorTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', onUpdate: 'CURRENT_TIMESTAMP(0)' })
  lastModifyTime: Date;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Menu, {cascade: true})
  menus: Menu[];

  @ManyToMany(() => Button_permission, {cascade: true})
  buttons: Button_permission[];

  @ManyToMany(() => Column_permission, {cascade: true})
  columns: Column_permission[];
}
