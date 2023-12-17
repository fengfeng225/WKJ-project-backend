import { Test, TestingModule } from '@nestjs/testing';
import { PipeCapController } from './pipe-cap.controller';
import { PipeCapService } from './pipe-cap.service';

describe('PipeCapController', () => {
  let controller: PipeCapController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipeCapController],
      providers: [PipeCapService],
    }).compile();

    controller = module.get<PipeCapController>(PipeCapController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
