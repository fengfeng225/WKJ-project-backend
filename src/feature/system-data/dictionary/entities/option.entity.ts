import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  BeforeInsert
} from 'typeorm';
import util from 'src/utils/util';
import { Dictionary } from './dictionary.entity';

@Entity()
export class SelectOption {
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
  fullName: string;

  @Column({
    length: 50,
    comment: '编码'
  })
  entityCode: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '说明'
  })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', select: false, comment: '创建时间' })
  creatorTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', onUpdate: 'CURRENT_TIMESTAMP(0)', select: false, comment: '上次更新时间' })
  lastModifyTime: Date;

  @ManyToOne(() => Dictionary, {cascade: true})
  dictionary: Dictionary;

  @Column({comment: '所属字段ID'})
  dictionaryId: string;
}
