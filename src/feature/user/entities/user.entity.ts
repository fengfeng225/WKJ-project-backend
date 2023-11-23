import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToMany,
    CreateDateColumn,
    UpdateDateColumn,
    Timestamp,
    JoinTable
} from "typeorm";
import { Role } from '../../role/entities/role.entity';

@Entity()
export class User{
    // 自增唯一主键
    @PrimaryGeneratedColumn()
    id:number;

    // 账户名类型
    @Column({
        unique: true,
        length: 50
    })
    account:string;

    // 密码
    @Column({
        length: 50,
        default: 'e10adc3949ba59abbe56e057f20f883e'
    })
    password:string;

    @Column({
        unique: true,
        length: 50
    })
    username: String;

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

    @ManyToMany(() => Role, role => role.users)
    @JoinTable({
        name: 'user_role_relation'
    })
    roles: Role[];
}