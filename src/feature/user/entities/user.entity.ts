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
    @PrimaryGeneratedColumn({ comment: '用户ID' })
    id:number;

    @Column({
        length: 50,
        comment: '账号'
    })
    account:string;

    @Exclude()
    @Column({
        length: 50,
        default: 'e10adc3949ba59abbe56e057f20f883e',
        comment: '密码'
    })
    password:string;

    @Column({
        length: 50,
        comment: '用户名'
    })
    username: String;

    @Column({
        type: 'int',
        default: 1,
        comment: '启用状态'
    })
    enabledMark: number;

    @Column({
        type: 'int',
        default: 0,
        comment: '表示删除',
        select: false
    })
    deleteMark: number;

    @Column({
        type: 'int',
        default: 0,
        comment: '排序'
    })
    sortCode: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', comment: '创建时间' })
    creatorTime: Timestamp;

    @Exclude()
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', onUpdate: 'CURRENT_TIMESTAMP(0)', select: false, comment: '上次更新时间' })
    lastModifyTime: Timestamp;

    @ManyToMany(() => Role, { cascade: true })
    @JoinTable({
        name: 'user_role_relation'
    })
    roles: Role[];
}