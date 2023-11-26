import { Test, TestingModule } from '@nestjs/testing';
import { MbService } from './mb.service';

describe('MbService', () => {
  let service: MbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MbService],
    }).compile();

    service = module.get<MbService>(MbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
