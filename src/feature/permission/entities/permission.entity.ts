import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Timestamp
} from 'typeorm';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50
  })
  fullName: string;

  @Column({
    length: 50
  })
  entityCode: string;

  @Column()
  enabledMark: number;

  @Column()
  sortCode: number;

  @CreateDateColumn()
  creatorTime: Timestamp;

  @UpdateDateColumn()
  lastModifyTime: Timestamp;
}