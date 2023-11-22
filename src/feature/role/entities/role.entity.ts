import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Timestamp
} from 'typeorm';
import { Permission } from '../../permission/entities/permission.entity';

@Entity()
export class Role {
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

  @Column()
  description: string;

  @Column()
  enabledMark: number;

  @Column()
  sortCode: number;

  @CreateDateColumn()
  creatorTime: Timestamp;

  @UpdateDateColumn()
  lastModifyTime: Timestamp;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permission_relation'
  })
  permissions: Permission[];
}
