import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  BeforeInsert
} from 'typeorm';
import util from 'src/utils/util';
import { BillClass } from '../../bill/class/entities/class.entity';

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
    comment: '名称'
  })
  fullName: string;

  @Column({
    length: 50,
    comment: '台账类别'
  })
  type: string;

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

  @Column({
    type: 'int',
    comment: '检查状态' // -1 - 未完成，0 - 待检查，1 - 完成，2 - 未完成但已处理
  })
  checkStatus: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', comment: '创建时间' })
  creatorTime: Date;

  @Column({ type: 'timestamp', nullable: true, comment: '检查时间' })
  checkedTime: Date;

  @Column({
    type: 'int',
    default: 1,
    comment: '当前周期的检查' // 0 - 过去，1 - 当前
  })
  checking: number;

  @Column({
    nullable: true,
    length: 50,
    comment: '检查人员'
  })
  inspector: string;

  @ManyToOne(() => BillClass, billClass => billClass.records)
  class: BillClass;

  @Column({comment: '所属班组ID'})
  classId: string;
}
