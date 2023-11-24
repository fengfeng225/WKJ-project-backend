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
export class Column_permission {
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

  @ManyToOne(() => Menu, (menu) => menu.columns)
  menu: Menu

  @ManyToMany(() => Role, (role) => role.columns)
  @JoinTable({
    name: 'role_column_relation'
  })
  roles: Role[];
}
