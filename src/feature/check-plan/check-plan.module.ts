import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckPlanService } from './check-plan.service';
import { CheckPlanController } from './check-plan.controller';
import { CheckPlanRunLog } from './entities/check-plan-run-log.entity';
import { CheckPlan } from './entities/check-plan.entity';
import { CheckRecord } from './entities/check-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckPlanRunLog, CheckPlan, CheckRecord])
  ],
  controllers: [CheckPlanController],
  providers: [CheckPlanService],
})
export class CheckPlanModule {}
