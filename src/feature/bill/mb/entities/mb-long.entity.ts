import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { MbClass } from './mb-class.entity';

@Entity()
export class MbLong {
  @PrimaryGeneratedColumn({ comment: '自然主键' })
  id: number;

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
      type: 'int',
      default: 0,
      comment: '表示删除'
  })
  deleteMark: number;

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
  classId: number;

  @ManyToOne(() => MbClass, {cascade: true})
  class: MbClass;
}
