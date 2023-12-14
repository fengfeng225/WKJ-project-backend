import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  DeleteDateColumn,
  BeforeInsert
} from 'typeorm';
import util from 'src/utils/util';
import { BillClass } from '../../../class/entities/class.entity';

@Entity()
export class UndergroundSludgeOil {
  @PrimaryColumn({ comment: '自然主键', length: 20, unique: true })
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = util.generateUniqueId();
  }

  @Column({
    length: 50,
    comment: '装置名称'
  })
  name: string;

  @Column({
    comment: '互窜点位置'
  })
  position: string;

  @Column({
    length: 50,
    comment: '前/后介质'
  })
  media: string;

  @Column({
    length: 50,
    comment: '前/后压力 (MPa)'
  })
  pressure: string;

  @Column({
    length: 50,
    comment: '隔离方式'
  })
  isolationWay: string;

  @Column({
    type: 'text',
    comment: '互窜后风险评价'
  })
  riskAssessment: string;

  @Column({
    type: 'text',
    comment: '防互窜控制措施'
  })
  controlMeasure: string;

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deletedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', comment: '创建时间' })
  creatorTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', onUpdate: 'CURRENT_TIMESTAMP(0)', select: false, comment: '上次更新时间' })
  lastModifyTime: Date;

  @Column({comment: '所属班组ID'})
  classId: string;

  @ManyToOne(() => BillClass, {cascade: true})
  class: BillClass;
}
