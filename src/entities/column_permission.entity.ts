import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Timestamp,
  ManyToOne,
  ManyToMany
} from 'typeorm';
import { Menu } from '../feature/menu/entities/menu.entity';
import { Role } from '../feature/role/entities/role.entity';

@Entity()
export class Column_permission {
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

  @ManyToOne(() => Menu, (menu) => menu.columns)
  menu: Menu

  @ManyToMany(() => Role, (role) => role.columns)
  roles: Role[];
}
