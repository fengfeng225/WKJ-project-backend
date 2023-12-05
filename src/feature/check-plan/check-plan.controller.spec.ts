import { Test, TestingModule } from '@nestjs/testing';
import { CheckPlanController } from './check-plan.controller';
import { CheckPlanService } from './check-plan.service';

describe('CheckPlanController', () => {
  let controller: CheckPlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckPlanController],
      providers: [CheckPlanService],
    }).compile();

    controller = module.get<CheckPlanController>(CheckPlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
