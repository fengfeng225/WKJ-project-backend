import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  BeforeInsert,
  DeleteDateColumn
} from 'typeorm';
import util from 'src/utils/util';
import { MbShort } from './mb-short.entity';
import { MbLong } from './mb-long.entity';
import { MbDisassembly } from './mb-disassembly.entity';

@Entity()
export class MbClass {
  @PrimaryColumn({ comment: '自然主键', length: 20, unique: true })
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = util.generateUniqueId();
  }

  @Column({
    length: 50,
    comment: '名称'
  })
  label: string;

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deletedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', comment: '创建时间' })
  creatorTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', onUpdate: 'CURRENT_TIMESTAMP(0)', select: false, comment: '上次更新时间' })
  lastModifyTime: Date;

  @OneToMany(() => MbShort, (mbShort) => mbShort.class)
  mbShorts: MbShort[];

  @OneToMany(() => MbLong, (mbLong) => mbLong.class)
  mbLongs: MbLong[];

  @OneToMany(() => MbDisassembly, (mbDisassembly) => mbDisassembly.class)
  mbDisassemblys: MbDisassembly[];
}
