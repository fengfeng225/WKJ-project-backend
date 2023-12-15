import {
  Column,
  Entity,
  OneToMany,
  ManyToMany,
  ManyToOne,
  JoinTable,
  PrimaryColumn,
  BeforeInsert,
  DeleteDateColumn
} from 'typeorm';
import util from 'src/utils/util';
import { CheckRecord } from 'src/feature/check-plan/entities/check-record.entity';
import { Role } from 'src/feature/role/entities/role.entity';
import { MbShort } from '../../mb/entities/mb-short.entity';
import { MbLong } from '../../mb/entities/mb-long.entity';
import { MbDisassembly } from '../../mb/entities/mb-disassembly.entity';
import { UndergroundSludgeOil } from '../../mutual-channeling-point/underground-sludge-oil/entities/underground-sludge-oil.entity';
import { HeatExchanger } from '../../mutual-channeling-point/heat-exchanger/entities/heat-exchanger.entity';
import { Container } from '../../mutual-channeling-point/container/entities/container.entity';
import { KeyPoint } from '../../mutual-channeling-point/key-point/entities/key-point.entity';
import { OtherPoint } from '../../mutual-channeling-point/other-point/entities/other-point.entity';

@Entity()
export class BillClass {
  @PrimaryColumn({ comment: '自然主键', length: 20, unique: true })
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = util.generateUniqueId();
  }

  @Column({
    length: 50,
    comment: '名称'
  })
  fullName: string;

  @Column({
    type: 'int',
    default: -1,
    comment: '当前短期盲板检查' // 0 - 待检查， 1 - 完成, -1 - 无检查
  })
  shortBillCheckingStatus: number;

  @Column({
    type: 'int',
    default: -1,
    comment: '历史短期盲板检查' // 1 - 正常， 0 - 异常, -1 - 无记录
  })
  shortBillCheckedStatus: number;

  @Column({
    type: 'int',
    default: -1,
    comment: '当前长期盲板检查'
  })
  longBillCheckingStatus: number;

  @Column({
    type: 'int',
    default: -1,
    comment: '历史长期盲板检查'
  })
  longBillCheckedStatus: number;

  @Column({
    type: 'int',
    default: -1,
    comment: '当前地下污油检查'
  })
  undergroundSludgeOilCheckingStatus: number;

  @Column({
    type: 'int',
    default: -1,
    comment: '历史地下污油检查'
  })
  undergroundSludgeOilCheckedStatus: number;

  @Column({
    type: 'int',
    default: -1,
    comment: '当前换热器检查'
  })
  heatExchangerCheckingStatus: number;

  @Column({
    type: 'int',
    default: -1,
    comment: '历史换热器检查'
  })
  heatExchangerCheckedStatus: number;

  @Column({
    type: 'int',
    default: -1,
    comment: '当前容器检查'
  })
  containerCheckingStatus: number;

  @Column({
    type: 'int',
    default: -1,
    comment: '历史容器检查'
  })
  containerCheckedStatus: number;

  @Column({
    type: 'int',
    default: -1,
    comment: '当前关键点检查'
  })
  keyPointCheckingStatus: number;

  @Column({
    type: 'int',
    default: -1,
    comment: '历史关键点检查'
  })
  keyPointCheckedStatus: number;

  @Column({
    type: 'int',
    default: -1,
    comment: '当前其他互窜点检查'
  })
  otherPointCheckingStatus: number;

  @Column({
    type: 'int',
    default: -1,
    comment: '历史其他互窜点检查'
  })
  otherPointCheckedStatus: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '排序'
  })
  sortCode: number;

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deletedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', comment: '创建时间' })
  creatorTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)', select: false, comment: '上次更新时间' })
  lastModifyTime: Date;

  @Column({ comment: '父级的ID', nullable: true })
  parentId: string;

  @ManyToOne(() => BillClass, billClass => billClass.children)
  parent: BillClass;

  @OneToMany(() => BillClass, billClass => billClass.parent)
  children: BillClass[];

  @OneToMany(() => MbShort, (mbShort) => mbShort.class)
  mbShorts: MbShort[];

  @OneToMany(() => MbLong, (mbLong) => mbLong.class)
  mbLongs: MbLong[];

  @OneToMany(() => MbDisassembly, (mbDisassembly) => mbDisassembly.class)
  mbDisassemblys: MbDisassembly[];

  @OneToMany(() => UndergroundSludgeOil, (undergroundSludgeOil) => undergroundSludgeOil.class)
  undergroundSludgeOils: UndergroundSludgeOil[]

  @OneToMany(() => HeatExchanger, (heatExchanger) => heatExchanger.class)
  heatExchangers: HeatExchanger[]

  @OneToMany(() => Container, (container) => container.class)
  containers: Container[]

  @OneToMany(() => KeyPoint, (keyPoint) => keyPoint.class)
  keyPoints: KeyPoint[]

  @OneToMany(() => OtherPoint, (otherPoint) => otherPoint.class)
  otherPoints: OtherPoint[]

  @OneToMany(() => CheckRecord, (checkRecord) => checkRecord.class)
  records: CheckRecord[]

  @ManyToMany(() => Role, {cascade: true})
  @JoinTable({
    name: 'role_class_relation'
  })
  roles: Role[];
}
