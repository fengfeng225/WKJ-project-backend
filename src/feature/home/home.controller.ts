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
  findSumBills() {
    return this.homeService.findSumBills();
  }

  @ApiOperation({summary:"获取本期检查计划列表"})
  @Get('newCheckRecord')
  findNewCheckRecord(@Req() req) {
    return this.homeService.findNewCheckRecord(req.user.userId, req.user.account);
  }

  @ApiOperation({summary:"获取本期各班组检查进度"})
  @Get('checkProgress')
  findCheckProgressList() {
    return this.homeService.findCheckProgressList();
  }

  @ApiOperation({summary:"获取PDF文件列表"})
  @Get('files')
  findPDFFiles() {
    return this.homeService.findPDFFiles();
  }
}
