import { Controller, Get, Body, Put, Param, Query } from '@nestjs/common';
import { CheckPlanService } from './check-plan.service';
import { UpdateCheckPlanDto } from './dto/update-check-plan.dto';
import { FindLogDto } from './dto/find-log.dto';
import { ApiQuery, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from 'src/decorators/require-permission';

@ApiTags('check-plan')
@ApiBearerAuth()
@RequirePermission('admin')
@Controller('scheduledTask/billCheckPlan')
export class CheckPlanController {
  constructor(private readonly checkPlanService: CheckPlanService) {}

  @ApiOperation({summary:"获取检查计划下发日志"})
  @ApiQuery({name: 'runResult', required: false})
  @ApiQuery({name: 'startTime', required: false})
  @ApiQuery({name: 'endTime', required: false})
  @ApiQuery({name: 'currentPage', required: false})
  @ApiQuery({name: 'pageSize', required: false})
  @Get(':id/log')
  findLogs(@Param('id') id: string, @Query() findLogDto: FindLogDto) {
    return this.checkPlanService.findLogs(id, findLogDto);
  }

  @ApiOperation({summary:"开启检查计划下发"})
  @Put('enable/:id')
  enableCheck(@Param('id') id: string) {
    return this.checkPlanService.enableCheck(id);
  }

  @ApiOperation({summary:"停止检查计划下发"})
  @Put('stop/:id')
  stopCheck(@Param('id') id: string) {
    return this.checkPlanService.stopCheck(id);
  }

  @ApiOperation({summary:"获取检查计划列表"})
  @ApiQuery({name: 'keyword', required: false})
  @Get()
  findAll(@Param('keyword') keyword: string) {
    return this.checkPlanService.findAll(keyword);
  }

  @ApiOperation({summary:"获取检查计划信息"})
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checkPlanService.findOne(id);
  }

  @ApiOperation({summary:"更新检查计划信息"})
  @Put(':id')
  update(@Param('id') id: string, @Body() updateCheckPlanDto: UpdateCheckPlanDto) {
    return this.checkPlanService.update(id, updateCheckPlanDto);
  }
}
