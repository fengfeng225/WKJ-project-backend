import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    Timestamp
} from "typeorm";
import { User_role_relation } from 'src/entities/user_role_relation.entity'

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

    @OneToMany(() => User_role_relation, user_role_relation => {user_role_relation.user})
    public user_role_relation: User_role_relation[];
}