import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MbService } from './mb.service';
import { MbController } from './mb.controller';
import { MbClass } from './entities/mb-class.entity';
import { MbShort } from './entities/mb-short.entity';
import { MbLong } from './entities/mb-long.entity';
import { MbDisassembly } from './entities/mb-disassembly.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MbClass, MbShort, MbLong, MbDisassembly])
  ],
  controllers: [MbController],
  providers: [MbService],
  exports: [TypeOrmModule]
})
export class MbModule {}
