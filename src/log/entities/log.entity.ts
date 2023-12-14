import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn({ comment: '自然主键' })
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', comment: '创建时间' })
  creatorTime: Date;

  @Column({ comment: '用户ID', length: 50, select: false, nullable: true })
  userId: string;

  @Column({ comment: '请求用户', length: 50, nullable: true })
  userName: string;

  @Column({ comment: '请求IP', length: 50, nullable: true })
  IPAddress: string;

  @Column({ type: 'int', comment: '日志类型' }) // 1 - 登录  2 - 请求  3 - 异常
  category: number;

  @Column({ comment: '请求方法', length: 50, nullable: true })
  requestMethod: string;

  @Column({ type: 'text', comment: '请求地址', nullable: true })
  requestURL: string;

  @Column({ type: 'text', comment: '平台设备', nullable: true })
  userAgent: string;

  @Column({ type: 'longtext', comment: '异常描述', nullable: true })
  errorMessage: string;

  @Column({type: 'json', comment: '请求数据', select: false, nullable: true })
  requestData: object;
}