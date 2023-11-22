import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
    Timestamp
} from "typeorm";
import { Role } from '../../role/entities/role.entity'

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
        length: 50
    })
    password:string;

    @Column({
        length: 50
    })
    username: String;

    @Column()
    enabledMark: number;

    @Column()
    sortCode: number;

    @CreateDateColumn()
    creatorTime: Timestamp;

    @UpdateDateColumn()
    lastModifyTime: Timestamp;

    @ManyToMany(() => Role)
    @JoinTable({
        name: 'user_role_relation'
    })
    roles: Role[];
}