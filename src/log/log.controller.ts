import { Controller, Get, Delete, Param, Query, Body } from '@nestjs/common';
import { ApiQuery, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LogService } from './log.service';
import { FindLogListDto } from './dto/find-log-list.dto';
import { DeleteLogsDto } from './dto/delete-logs.dto';
import { RequirePermission } from 'src/decorators/require-permission';

@ApiTags('log')
@ApiBearerAuth()
@RequirePermission('admin')
@Controller('system/log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @ApiOperation({summary:"获取日志列表"})
  @ApiQuery({name: 'keyword', required: false})
  @ApiQuery({name: 'startTime', required: false})
  @ApiQuery({name: 'endTime', required: false})
  @ApiQuery({name: 'currentPage', required: false})
  @ApiQuery({name: 'pageSize', required: false})
  @Get(':category')
  getLogList(@Param('category') category: string, @Query() findLogListDto: FindLogListDto) {
    return this.logService.getLogList(+category, findLogListDto);
  }

  @ApiOperation({summary:"删除日志"})
  @Delete()
  removeLogs(@Body() deleteLogsDto: DeleteLogsDto) {
    return this.logService.removeLogs(deleteLogsDto);
  }
}
