import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckPlanService } from './check-plan.service';
import { CheckPlanController } from './check-plan.controller';
import { CheckPlanRunLog } from './entities/check-plan-run-log.entity';
import { CheckPlan } from './entities/check-plan.entity';
import { CheckRecord } from './entities/check-record.entity';
import { MbModule } from '../bill/mb/mb.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckPlanRunLog, CheckPlan, CheckRecord]),
    MbModule
  ],
  controllers: [CheckPlanController],
  providers: [CheckPlanService],
})
export class CheckPlanModule implements OnModuleInit {
  constructor(private checkPlanService: CheckPlanService) {}

  async onModuleInit() {
    await this.checkPlanService.initScheduledTask();
  }
}
