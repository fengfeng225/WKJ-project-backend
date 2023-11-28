import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { SelectOption } from './option.entity';

@Entity()
export class Dictionary {
  @PrimaryGeneratedColumn({comment: '自然主键'})
  id: number;

  @Column({
    length: 50,
    comment: '名称'
  })
  fullName: string;

  @Column({
    length: 50,
    comment: '编码'
  })
  entityCode: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '说明'
  })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', select: false, comment: '创建时间' })
  creatorTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', onUpdate: 'CURRENT_TIMESTAMP(0)', select: false, comment: '上次更新时间' })
  lastModifyTime: Date;

  @OneToMany(() => SelectOption, selectOption => selectOption.dictionary)
  options: SelectOption[];
}
