import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  DeleteDateColumn,
  BeforeInsert
} from 'typeorm';
import util from 'src/utils/util';
import { BillClass } from '../../class/entities/class.entity';

@Entity()
export class PipeCap {
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
    comment: '放空阀封堵位置'
  })
  position: string;

  @Column({
    length: 50,
    comment: '介质'
  })
  media: string;

  @Column({
    length: 50,
    comment: '介质最高操作温度 (℃)'
  })
  temperature: string;

  @Column({
    length: 50,
    comment: '介质最高操作压力 (MPa)'
  })
  pressure: string;

  @Column({
    length: 50,
    comment: '放空阀封堵直径 (DN)'
  })
  diameter: string;

  @Column({
    length: 50,
    comment: '放空阀封堵类型'
  })
  type: string;

  @Column({
    length: 50,
    comment: '封堵形式'
  })
  plugging: string;

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
