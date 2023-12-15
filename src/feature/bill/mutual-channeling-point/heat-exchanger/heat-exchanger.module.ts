import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeatExchangerService } from './heat-exchanger.service';
import { HeatExchangerController } from './heat-exchanger.controller';
import { HeatExchanger } from './entities/heat-exchanger.entity';
import { BillClass } from '../../class/entities/class.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HeatExchanger, BillClass])
  ],
  controllers: [HeatExchangerController],
  providers: [HeatExchangerService],
})
export class HeatExchangerModule {}
