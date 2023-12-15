import { Test, TestingModule } from '@nestjs/testing';
import { KeyPointService } from './key-point.service';

describe('KeyPointService', () => {
  let service: KeyPointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeyPointService],
    }).compile();

    service = module.get<KeyPointService>(KeyPointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
