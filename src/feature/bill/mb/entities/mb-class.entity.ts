import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { MbShort } from './mb-short.entity';
import { MbLong } from './mb-long.entity';

@Entity()
export class MbClass {
  @PrimaryGeneratedColumn({ comment: '自然主键' })
  id: number;

  @Column({
    length: 50,
    comment: '名称'
  })
  label: string;

  @Column({
    type: 'int',
    default: 0,
    comment: '表示删除',
    select: false
  })
  deleteMark: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', comment: '创建时间' })
  creatorTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', onUpdate: 'CURRENT_TIMESTAMP(0)', select: false, comment: '上次更新时间' })
  lastModifyTime: Date;

  @OneToMany(() => MbShort, (mbShort) => mbShort.class)
  mbShorts: MbShort[];

  @OneToMany(() => MbLong, (mbLong) => mbLong.class)
  mbLongs: MbLong[];
}
