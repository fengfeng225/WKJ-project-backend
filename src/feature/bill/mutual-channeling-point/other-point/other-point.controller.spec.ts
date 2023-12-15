import { Test, TestingModule } from '@nestjs/testing';
import { OtherPointController } from './other-point.controller';
import { OtherPointService } from './other-point.service';

describe('OtherPointController', () => {
  let controller: OtherPointController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtherPointController],
      providers: [OtherPointService],
    }).compile();

    controller = module.get<OtherPointController>(OtherPointController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
