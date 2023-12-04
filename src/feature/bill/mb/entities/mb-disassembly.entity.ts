import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  BeforeInsert,
  DeleteDateColumn
} from 'typeorm';
import util from 'src/utils/util';
import { MbClass } from './mb-class.entity';

@Entity()
export class MbDisassembly {
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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', comment: '该记录产生时间', select: false })
  creatorTime: Date;

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deletedAt: Date;

  @Column({
    length: 50,
    comment: '拆装操作说明'
  })
  remark: string;

  @Column({
    length: 50,
    comment: '盲板所属周期'
  })
  cycleType: string;

  @Column({comment: '所属班组ID'})
  classId: string;

  @ManyToOne(() => MbClass, {cascade: true})
  class: MbClass;
}
