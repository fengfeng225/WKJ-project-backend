import { Controller, Get, Req } from '@nestjs/common';
import { HomeService } from './home.service';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('home')
@ApiBearerAuth()
@Controller('admin/home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @ApiOperation({summary:"获取各台账总数"})
  @Get('sumBills')
  findAll(@Req() req) {
    return this.homeService.findAll(req.user.userId, req.user.account);
  }
}
