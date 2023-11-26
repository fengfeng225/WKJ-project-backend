import { Test, TestingModule } from '@nestjs/testing';
import { MbController } from './mb.controller';
import { MbService } from './mb.service';

describe('MbController', () => {
  let controller: MbController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MbController],
      providers: [MbService],
    }).compile();

    controller = module.get<MbController>(MbController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
