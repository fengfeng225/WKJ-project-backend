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
export class MbShort {
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
    comment: '盲板编号'
  })
  code: string;

  @Column({
    length: 50,
    comment: '管径'
  })
  pipDiameter: string;

  @Column({
    type: 'text',
    comment: '盲板安装位置描述'
  })
  description: string;

  @Column({
    type: 'int',
    comment: '盲通状态'
  })
  status: number;

  @Column({ type: 'timestamp', comment: '拆装时间' })
  disassembleTime: Date;

  @Column({
    length: 50,
    comment: '管线介质名称'
  })
  pipelineMediaName: string;

  @Column({
    length: 50,
    comment: '管线介质温度 (℃)'
  })
  pipelineMediaTemperature: string;

  @Column({
    length: 50,
    comment: '管线介质压力 (MPa)'
  })
  pipelineMediaPressure: string;

  @Column({
    length: 50,
    comment: '盲板规格 (mm)'
  })
  size: string;

  @Column({
    length: 50,
    comment: '盲板形式'
  })
  type: string;

  @Column({
    length: 50,
    comment: '盲板材质'
  })
  material: string;

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deletedAt: Date;

  @Column({
    length: 50,
    comment: '操作人员'
  })
  operator: string;

  @Column({
    length: 50,
    comment: '管理干部'
  })
  manager: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', comment: '创建时间' })
  creatorTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', onUpdate: 'CURRENT_TIMESTAMP(0)', select: false, comment: '上次更新时间' })
  lastModifyTime: Date;

  @Column({comment: '所属班组ID'})
  classId: string;

  @ManyToOne(() => BillClass, {cascade: true})
  class: BillClass;
}
