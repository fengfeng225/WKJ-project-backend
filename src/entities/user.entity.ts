import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Post } from "./post.entity"; 

@Entity()
export class User{
    // 自增唯一主键
    @PrimaryGeneratedColumn()
    id:number;

    // 账户名类型
    @Column({ unique: true })
    account:string;

    // 密码
    @Column()
    password:string;

    // 用户管理文章 多个文章对应一个用户
    @OneToMany(() => Post,post=>post.user)
    posts:Post[];
}