import {
    Column,
    Entity,
    PrimaryColumn,
    ManyToMany,
    JoinTable,
    BeforeInsert,
    DeleteDateColumn
} from "typeorm";
import util from 'src/utils/util';
import { Role } from '../../role/entities/role.entity';

@Entity()
export class User{
    @PrimaryColumn({ comment: '自然主键', length: 20, unique: true })
    id: string;

    @BeforeInsert()
    generateId() {
      this.id = util.generateUniqueId();
    }

    @Column({
        length: 50,
        comment: '账号'
    })
    account:string;

    @Column({
        length: 50,
        default: 'e10adc3949ba59abbe56e057f20f883e',
        comment: '密码',
        select: false
    })
    password:string;

    @Column({
        length: 50,
        comment: '用户名'
    })
    userName: string;

    @Column({
        type: 'int',
        default: 1,
        comment: '启用状态'
    })
    enabledMark: number;

    @Column({
        type: 'int',
        default: 0,
        comment: '排序'
    })
    sortCode: number;

    @Column({
      type: 'text',
      nullable: true,
      comment: '说明'
    })
    description: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', comment: '创建时间' })
    creatorTime: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', onUpdate: 'CURRENT_TIMESTAMP(0)', select: false, comment: '上次更新时间' })
    lastModifyTime: Date;

    @DeleteDateColumn({ name: 'deleted_at', select: false })
    deletedAt: Date;

    @ManyToMany(() => Role, { cascade: true })
    @JoinTable({
        name: 'user_role_relation'
    })
    roles: Role[];
}
