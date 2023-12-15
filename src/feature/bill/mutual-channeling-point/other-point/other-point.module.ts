import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtherPointService } from './other-point.service';
import { OtherPointController } from './other-point.controller';
import { OtherPoint } from './entities/other-point.entity';
import { BillClass } from '../../class/entities/class.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OtherPoint, BillClass])
  ],
  controllers: [OtherPointController],
  providers: [OtherPointService],
})
export class OtherPointModule {}
