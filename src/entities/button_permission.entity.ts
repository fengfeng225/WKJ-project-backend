import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { Menu } from '../feature/menu/entities/menu.entity';
import { Role } from '../feature/role/entities/role.entity';

@Entity()
export class Button_permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50
  })
  fullName: string;

  @Column({
    length: 50
  })
  entityCode: string;

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', select: false })
  creatorTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', onUpdate: 'CURRENT_TIMESTAMP(0)', select: false })
  lastModifyTime: Date;

  @ManyToOne(() => Menu, {cascade: true})
  menu: Menu

  @ManyToMany(() => Role, (role) => role.buttons)
  @JoinTable({
    name: 'role_button_relation'
  })
  roles: Role[];
}
