import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  BeforeInsert,
  DeleteDateColumn
} from 'typeorm';
import { MbShort } from './mb-short.entity';
import { MbLong } from './mb-long.entity';
import { MbDisassembly } from './mb-disassembly.entity';

@Entity()
export class MbClass {
  @PrimaryColumn({ comment: '自然主键', length: 18, unique: true })
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = generateUniqueId();
  }

  @Column({
    length: 50,
    comment: '名称'
  })
  label: string;

  @DeleteDateColumn({ name: 'deleted_at' })
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

function generateUniqueId(): string {
  const timestamp = Date.now().toString();
  const randomDigits = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return timestamp + randomDigits;
}
