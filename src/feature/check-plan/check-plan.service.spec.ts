import { Test, TestingModule } from '@nestjs/testing';
import { CheckPlanService } from './check-plan.service';

describe('CheckPlanService', () => {
  let service: CheckPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckPlanService],
    }).compile();

    service = module.get<CheckPlanService>(CheckPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
