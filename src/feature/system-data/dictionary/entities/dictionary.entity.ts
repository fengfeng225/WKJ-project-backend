import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  BeforeInsert
} from 'typeorm';
import { SelectOption } from './option.entity';

@Entity()
export class Dictionary {
  @PrimaryColumn({ comment: '自然主键', length: 18, unique: true })
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = generateUniqueId();
  }

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

function generateUniqueId(): string {
  const timestamp = Date.now().toString();
  const randomDigits = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return timestamp + randomDigits;
}
