import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { BillClass } from './entities/class.entity';
import { CheckRecord } from '../../check-plan/entities/check-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BillClass, CheckRecord])
  ],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [TypeOrmModule]
})
export class ClassModule {}
