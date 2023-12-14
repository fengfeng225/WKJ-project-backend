import { Test, TestingModule } from '@nestjs/testing';
import { UndergroundSludgeOilService } from './underground-sludge-oil.service';

describe('UndergroundSludgeOilService', () => {
  let service: UndergroundSludgeOilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UndergroundSludgeOilService],
    }).compile();

    service = module.get<UndergroundSludgeOilService>(UndergroundSludgeOilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
