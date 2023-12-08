import { Controller, Get, Body, Put, Param, Query } from '@nestjs/common';
import { CheckPlanService } from './check-plan.service';
import { UpdateCheckPlanDto } from './dto/update-check-plan.dto';
import { FindLogDto } from './dto/find-log.dto';
import { CheckInfoDto } from './dto/check-info.dto';
import { FixRecordDto } from './dto/fix-record.dto';
import { ApiQuery, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from 'src/decorators/require-permission';

@ApiTags('billCheck')
@ApiBearerAuth()
@Controller('scheduledTask')
export class CheckPlanController {
  constructor(private readonly checkPlanService: CheckPlanService) {}

  // 初始化测试数据
  @Get('checkPlan/init')
  init() {
    return this.checkPlanService.init()
  }


  @ApiOperation({summary:"获取检查计划下发日志"})
  @ApiQuery({name: 'runResult', required: false})
  @ApiQuery({name: 'startTime', required: false})
  @ApiQuery({name: 'endTime', required: false})
  @ApiQuery({name: 'currentPage', required: false})
  @ApiQuery({name: 'pageSize', required: false})
  @Get('checkPlan/:id/log')
  findLogs(@Param('id') id: string, @Query() findLogDto: FindLogDto) {
    return this.checkPlanService.findLogs(id, findLogDto);
  }

  @ApiOperation({summary:"开启检查计划下发"})
  @Put('checkPlan/enable/:id')
  enableCheck(@Param('id') id: string) {
    return this.checkPlanService.enableCheck(id);
  }

  @ApiOperation({summary:"停止检查计划下发"})
  @Put('checkPlan/stop/:id')
  stopCheck(@Param('id') id: string) {
    return this.checkPlanService.stopCheck(id);
  }

  @ApiOperation({summary:"获取检查计划列表"})
  @ApiQuery({name: 'keyword', required: false})
  @Get('checkPlan')
  findAll(@Param('keyword') keyword: string) {
    return this.checkPlanService.findAll(keyword);
  }

  @ApiOperation({summary:"获取检查计划信息"})
  @Get('checkPlan/:id')
  findOne(@Param('id') id: string) {
    return this.checkPlanService.findOne(id);
  }

  @ApiOperation({summary:"更新检查计划信息"})
  @Put('checkPlan/:id')
  update(@Param('id') id: string, @Body() updateCheckPlanDto: UpdateCheckPlanDto) {
    return this.checkPlanService.update(id, updateCheckPlanDto);
  }

  @ApiOperation({summary:"一键检查"})
  @Put('bill/checkAll')
  checkAll(@Body() checkInfoDto: CheckInfoDto) {
    return this.checkPlanService.checkAll(checkInfoDto);
  }

  @ApiOperation({summary:"获取检查记录"})
  @Get('bill/:id/checkRecords/:type')
  getRecords(@Param('id') id: string, @Param('type') type: string) {
    return this.checkPlanService.getRecords(id, type);
  }

  @ApiOperation({summary:"处理检查异常"})
  @Put('bill/checkRecord/fix/:id')
  fixRecord(@Param('id') id: string, @Body() fixRecordDto: FixRecordDto) {
    return this.checkPlanService.fixRecord(id, fixRecordDto);
  }
}
