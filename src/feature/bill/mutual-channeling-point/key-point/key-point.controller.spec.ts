import { Test, TestingModule } from '@nestjs/testing';
import { KeyPointController } from './key-point.controller';
import { KeyPointService } from './key-point.service';

describe('KeyPointController', () => {
  let controller: KeyPointController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeyPointController],
      providers: [KeyPointService],
    }).compile();

    controller = module.get<KeyPointController>(KeyPointController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
