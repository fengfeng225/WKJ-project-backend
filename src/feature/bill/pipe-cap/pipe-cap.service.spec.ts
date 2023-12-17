import { Test, TestingModule } from '@nestjs/testing';
import { PipeCapService } from './pipe-cap.service';

describe('PipeCapService', () => {
  let service: PipeCapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PipeCapService],
    }).compile();

    service = module.get<PipeCapService>(PipeCapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
