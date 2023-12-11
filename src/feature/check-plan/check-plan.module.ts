import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckPlanService } from './check-plan.service';
import { CheckPlanController } from './check-plan.controller';
import { CheckPlanRunLog } from './entities/check-plan-run-log.entity';
import { CheckPlan } from './entities/check-plan.entity';
import { ClassModule } from '../bill/class/class.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckPlanRunLog, CheckPlan]),
    ClassModule
  ],
  controllers: [CheckPlanController],
  providers: [CheckPlanService],
  exports: [TypeOrmModule]
})
export class CheckPlanModule implements OnModuleInit {
  constructor(private checkPlanService: CheckPlanService) {}

  async onModuleInit() {
    await this.checkPlanService.initScheduledTask();
  }
}
