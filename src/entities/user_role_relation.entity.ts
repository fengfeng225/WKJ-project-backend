import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp
} from "typeorm";
import { User } from '../feature/user/entities/user.entity'
import { Role } from '../feature/role/entities/role.entity'

@Entity()
export class User_role_relation{
  // 自增唯一主键
  @PrimaryGeneratedColumn()
  public id:number;

  // userId
  @Column()
  public userId:number;

  // roleId
  @Column()
  public roleId:number;

  @Column()
  public sortCode: number;

  @CreateDateColumn()
  public creatorTime: Timestamp;

  @UpdateDateColumn()
  public lastModifyTime: Timestamp;

  @ManyToOne(() => User, (user) => {user.user_role_relation})
  public user: User;

  @ManyToOne(() => Role, (role) => {role.user_role_relation})
  public role: Role;
}