import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn({ comment: '自然主键' })
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', comment: '创建时间' })
  creatorTime: Date;

  @Column({ comment: '请求方法' })
  method: string;

  @Column({ comment: '请求地址' })
  path: string;

  @Column('json', { nullable: true, comment: '请求数据' })
  requestData: object;

  constructor(method: string, path: string, requestData: object) {
    this.method = method;
    this.path = path;
    this.requestData = requestData;
  }
}