import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinTable,
  PrimaryGeneratedColumn,
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
    type: 'int'
  })
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
    type: 'longtext'
  })
  urlAddress: string;

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

  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => Menu, menu => menu.children)
  parent: Menu;

  @OneToMany(() => Menu, menu => menu.parent)
  children: Menu[];

  @OneToMany(() => Button_permission, (button) => button.menu)
  buttons: Button_permission[]

  @OneToMany(() => Column_permission, (column) => column.menu)
  columns: Column_permission[]

  @ManyToMany(() => Role, { cascade: true })
  @JoinTable({
    name: 'role_menu_relation'
  })
  roles: Role[];
}
