import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { RequireLogin } from 'src/decorators/require-login';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('test')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @RequireLogin()
  @Get('getIds/:count')
  getIds(@Param('count') count: number) {
    return this.appService.getIds(count);
  }
}
