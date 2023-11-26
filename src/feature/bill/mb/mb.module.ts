import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MbService } from './mb.service';
import { MbController } from './mb.controller';
import { MbClass } from './entities/mb-class.entity';
import { MbShort } from './entities/mb-short.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MbClass, MbShort])
  ],
  controllers: [MbController],
  providers: [MbService],
})
export class MbModule {}
