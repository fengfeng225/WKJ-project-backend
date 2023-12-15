import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { MbModule } from '../bill/mb/mb.module';
import { CheckRecord } from '../check-plan/entities/check-record.entity';
import { Container } from '../bill/mutual-channeling-point/container/entities/container.entity';
import { HeatExchanger } from '../bill/mutual-channeling-point/heat-exchanger/entities/heat-exchanger.entity';
import { KeyPoint } from '../bill/mutual-channeling-point/key-point/entities/key-point.entity';
import { OtherPoint } from '../bill/mutual-channeling-point/other-point/entities/other-point.entity';
import { UndergroundSludgeOil } from '../bill/mutual-channeling-point/underground-sludge-oil/entities/underground-sludge-oil.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckRecord, Container, HeatExchanger, KeyPoint, OtherPoint, UndergroundSludgeOil]),
    MbModule
  ],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
