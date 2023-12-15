import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyPointService } from './key-point.service';
import { KeyPointController } from './key-point.controller';
import { KeyPoint } from './entities/key-point.entity';
import { BillClass } from '../../class/entities/class.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([KeyPoint, BillClass])
  ],
  controllers: [KeyPointController],
  providers: [KeyPointService],
})
export class KeyPointModule {}
