import { Test, TestingModule } from '@nestjs/testing';
import { HeatExchangerController } from './heat-exchanger.controller';
import { HeatExchangerService } from './heat-exchanger.service';

describe('HeatExchangerController', () => {
  let controller: HeatExchangerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeatExchangerController],
      providers: [HeatExchangerService],
    }).compile();

    controller = module.get<HeatExchangerController>(HeatExchangerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
