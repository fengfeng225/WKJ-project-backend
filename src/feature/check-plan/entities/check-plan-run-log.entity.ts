import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  BeforeInsert
} from 'typeorm';
import util from 'src/utils/util';
import { CheckPlan } from './check-plan.entity';

@Entity()
export class CheckPlanRunLog {
  @PrimaryColumn({ comment: '自然主键', length: 20, unique: true })
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = util.generateUniqueId();
  }

  @Column({
    type: 'int',
    comment: '下发结果，1-成功，0-失败'
  })
  runResult: number;

  @Column({
    type: 'text',
    nullable: true,
    comment: '说明'
  })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', comment: '创建时间' })
  creatorTime: Date;

  @ManyToOne(() => CheckPlan, checkPlan => checkPlan.logs)
  checkPlan: CheckPlan;

  @Column({comment: '所属检查计划ID'})
  checkPlanId: string;
}
