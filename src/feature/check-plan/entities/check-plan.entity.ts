import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  BeforeInsert
} from 'typeorm';
import util from 'src/utils/util';
import { CheckPlanRunLog } from './check-plan-run-log.entity';

@Entity()
export class CheckPlan {
  @PrimaryColumn({ comment: '自然主键', length: 20, unique: true })
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = util.generateUniqueId();
  }

  @Column({
    length: 50,
    comment: '台账名称'
  })
  fullName: string;

  @Column({
    length: 50,
    comment: '编码'
  })
  entityCode: string;

  @Column({
    length: 50,
    comment: '班组类型'
  })
  classType: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '说明'
  })
  description: string;

  @Column({
    type: 'int',
    default: 0,
    comment: '下发次数'
  })
  runCount: number;

  @Column({
    length: 50,
    comment: 'cron表达式'
  })
  cron: string;

  @Column({
    nullable: true,
    type: 'timestamp',
    comment: '最后下发时间'
  })
  lastRunTime: Date;

  @Column({
    nullable: true,
    type: 'timestamp',
    comment: '下次下发时间'
  })
  nextRunTime: Date;

  @Column({
    type: 'int',
    default: 0,
    comment: '排序'
  })
  sortCode: number;

  @Column({
    type: 'int',
    default: 1,
    comment: '启用状态'
  })
  enabledMark: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', comment: '创建时间' })
  creatorTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', select: false, comment: '上次更新时间' })
  lastModifyTime: Date;

  @OneToMany(() => CheckPlanRunLog, log => log.checkPlan)
  logs: CheckPlanRunLog[];
}
