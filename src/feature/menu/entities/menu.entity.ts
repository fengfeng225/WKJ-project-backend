import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Timestamp,
  ManyToMany
} from 'typeorm';
import { Button_permission } from 'src/entities/button_permission.entity';
import { Column_permission } from 'src/entities/column_permission.entity';
import { Role } from '../../role/entities/role.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: -1
  })
  parentId: number;

  @Column()
  type: number;

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
    length: 50
  })
  icon: string;

  @Column({
    nullable: true,
    length: 50
  })
  urlAddress: string;

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

  @ManyToOne(() => Menu, menu => menu.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Menu;

  @ManyToOne(() => Menu, menu => menu.parent)
  children: Menu[];

  @OneToMany(() => Button_permission, (button) => button.menu)
  buttons: Button_permission[]

  @OneToMany(() => Column_permission, (column) => column.menu)
  columns: Column_permission[]

  @ManyToMany(() => Role, (role) => {role.menus})
  roles: Role[];
}
