import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Timestamp
} from 'typeorm';
import { User_role_relation } from 'src/entities/user_role_relation.entity'

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

  @OneToMany(() => User_role_relation, (user_role_relation) => {user_role_relation.role})
  public user_role_relation: User_role_relation[];
}
