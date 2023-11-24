import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToMany,
    JoinTable,
    Timestamp
} from "typeorm";
import { Exclude } from 'class-transformer';
import { Role } from '../../role/entities/role.entity';

@Entity()
export class User{
    // 自增唯一主键
    @PrimaryGeneratedColumn()
    id:number;

    // 账户
    @Column({
        unique: true,
        length: 50
    })
    account:string;

    // 密码
    @Exclude()
    @Column({
        length: 50,
        default: 'e10adc3949ba59abbe56e057f20f883e'
    })
    password:string;

    // 用户名
    @Column({
        unique: true,
        length: 50
    })
    username: String;

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
    creatorTime: Timestamp;

    @Exclude()
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', onUpdate: 'CURRENT_TIMESTAMP(0)' })
    lastModifyTime: Timestamp;

    @ManyToMany(() => Role, { cascade: true })
    @JoinTable({
        name: 'user_role_relation'
    })
    roles: Role[];
}