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
export class HeatExchanger {
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
    length: 50,
    comment: '设备名称'
  })
  equipmentName: string;

  @Column({
    length: 50,
    comment: '设备位号'
  })
  equipmentTag: string;

  @Column({
    length: 50,
    comment: '设计(操作)压力  管/壳'
  })
  pressure: string;

  @Column({
    length: 50,
    comment: '设计(操作)温度 管/壳'
  })
  temperature: string;

  @Column({
    length: 50,
    comment: '介质 壳/管'
  })
  media: string;

  @Column({
    length: 50,
    comment: '规格型号'
  })
  size: string;

  @Column({
    type: 'text',
    comment: '内漏判断'
  })
  endoleakageJudge: string;

  @Column({
    type: 'text',
    comment: '内漏后风险评价'
  })
  endoleakageRiskAssessment: string;

  @Column({
    type: 'text',
    comment: '内漏后处理'
  })
  endoleakageDispose: string;

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
