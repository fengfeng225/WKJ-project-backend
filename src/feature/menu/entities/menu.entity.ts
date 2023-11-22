import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Timestamp } from "typeorm";

@Entity()
export class Menulist{
    // 自增唯一主键
    @PrimaryGeneratedColumn()
    id:number;

    // 编码
    @Column({ unique: true })
    entitycode:string;

    // 名称
    @Column({ unique: true })
    name:string;

    @CreateDateColumn({type: 'timestamp'})
    creatorTime: Timestamp;

    @UpdateDateColumn({type: 'timestamp'})
    lastModifyTime: Timestamp;
}