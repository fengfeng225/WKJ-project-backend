import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UndergroundSludgeOilService } from './underground-sludge-oil.service';
import { UndergroundSludgeOilController } from './underground-sludge-oil.controller';
import { UndergroundSludgeOil } from './entities/underground-sludge-oil.entity';
import { BillClass } from '../../class/entities/class.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UndergroundSludgeOil, BillClass])
  ],
  controllers: [UndergroundSludgeOilController],
  providers: [UndergroundSludgeOilService],
})
export class UndergroundSludgeOilModule {}
