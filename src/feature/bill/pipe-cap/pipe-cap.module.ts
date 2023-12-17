import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipeCapService } from './pipe-cap.service';
import { PipeCapController } from './pipe-cap.controller';
import { PipeCap } from './entities/pipe-cap.entity';
import { BillClass } from '../class/entities/class.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PipeCap, BillClass])
  ],
  controllers: [PipeCapController],
  providers: [PipeCapService],
})
export class PipeCapModule {}
