import { Test, TestingModule } from '@nestjs/testing';
import { OtherPointService } from './other-point.service';

describe('OtherPointService', () => {
  let service: OtherPointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtherPointService],
    }).compile();

    service = module.get<OtherPointService>(OtherPointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
