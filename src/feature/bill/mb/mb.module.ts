import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MbService } from './mb.service';
import { MbController } from './mb.controller';
import { MbShort } from './entities/mb-short.entity';
import { MbLong } from './entities/mb-long.entity';
import { MbDisassembly } from './entities/mb-disassembly.entity';
import { BillClass } from '../class/entities/class.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MbShort, MbLong, MbDisassembly, BillClass])
  ],
  controllers: [MbController],
  providers: [MbService],
  exports: [TypeOrmModule]
})
export class MbModule {}
