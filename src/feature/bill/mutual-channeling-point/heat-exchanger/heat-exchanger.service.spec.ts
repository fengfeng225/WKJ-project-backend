import { Test, TestingModule } from '@nestjs/testing';
import { HeatExchangerService } from './heat-exchanger.service';

describe('HeatExchangerService', () => {
  let service: HeatExchangerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HeatExchangerService],
    }).compile();

    service = module.get<HeatExchangerService>(HeatExchangerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
