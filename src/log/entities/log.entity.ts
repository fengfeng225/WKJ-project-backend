import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn({ comment: '自然主键' })
  id: number;

  @Column({ comment: '执行结果', length: 50 })
  type: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', comment: '创建时间' })
  creatorTime: Date;

  @Column({ comment: '请求用户', length: 50 })
  userName: string;

  @Column({ comment: '请求方法', length: 50 })
  requestMethod: string;

  @Column({ comment: '请求地址' })
  requestURL: string;

  @Column({ comment: 'UA' })
  userAgent: string;

  @Column('json', { nullable: true, comment: '请求数据', select: false })
  requestData: object;

  constructor(requestMethod: string, requestURL: string, requestData: object, userName: string, userAgent: string, type: string) {
    this.requestMethod = requestMethod;
    this.requestURL = requestURL;
    this.requestData = requestData;
    this.userName = userName
    this.userAgent = userAgent
    this.type = type
  }
}