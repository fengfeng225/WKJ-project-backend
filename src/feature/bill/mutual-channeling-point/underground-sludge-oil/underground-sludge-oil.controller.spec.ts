import { Test, TestingModule } from '@nestjs/testing';
import { UndergroundSludgeOilController } from './underground-sludge-oil.controller';
import { UndergroundSludgeOilService } from './underground-sludge-oil.service';

describe('UndergroundSludgeOilController', () => {
  let controller: UndergroundSludgeOilController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UndergroundSludgeOilController],
      providers: [UndergroundSludgeOilService],
    }).compile();

    controller = module.get<UndergroundSludgeOilController>(UndergroundSludgeOilController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
