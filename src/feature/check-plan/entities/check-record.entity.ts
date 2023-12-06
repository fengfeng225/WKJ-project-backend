import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  BeforeInsert
} from 'typeorm';
import util from 'src/utils/util';
import { MbClass } from '../../bill/mb/entities/mb-class.entity';

@Entity()
export class CheckRecord {
  @PrimaryColumn({ comment: '自然主键', length: 20, unique: true })
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = util.generateUniqueId();
  }

  @Column({
    length: 50,
    comment: '台账类别' // 待更新 例如 1月检查
  })
  fullName: string;

  @Column({
    length: 50,
    comment: '编码'
  })
  entityCode: string;

  @Column({
    type: 'int',
    comment: '检查状态, 0表示待检查，1表示完成，-1表示未完成，2表示未完成但已处理'
  })
  checkStatus: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', comment: '创建时间' })
  creatorTime: Date;

  @Column({ type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP(0)', comment: '检查时间' })
  checkedTime: Date;

  @Column({
    type: 'int',
    default: 1,
    comment: '当前周期的检查'
  })
  checking: number;

  @Column({
    nullable: true,
    length: 50,
    comment: '检查人员'
  })
  inspector: string;

  @ManyToOne(() => MbClass, mbClass => mbClass.records)
  class: MbClass;

  @Column({comment: '所属班组ID'})
  classId: string;
}
