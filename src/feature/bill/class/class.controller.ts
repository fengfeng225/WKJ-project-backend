import { Controller, Get, Post, Body, Put, Param, Query, Delete } from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { CheckInfoDto } from './dto/check-info.dto';
import { FixRecordDto } from './dto/fix-record.dto';
import { RequireLogin } from 'src/decorators/require-login';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from 'src/decorators/require-permission';

@ApiTags('billClass')
@ApiBearerAuth()
@Controller('admin/bill/class')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  // 初始化测试数据
  @RequireLogin()
  @Get('init')
  async initClass() {
    await this.classService.initClass()
    return 'done'
  }

  @ApiOperation({summary:"一键检查"})
  @Put('checkAll')
  checkAll(@Body() checkInfoDto: CheckInfoDto) {
    return this.classService.checkAll(checkInfoDto);
  }

  @ApiOperation({summary:"获取检查记录"})
  @Get(':id/checkRecords/:type')
  getRecords(@Param('id') id: string, @Param('type') type: string) {
    return this.classService.getRecords(id, type);
  }

  @ApiOperation({summary:"处理检查异常"})
  @Put('checkRecord/fix/:id')
  fixRecord(@Param('id') id: string, @Body() fixRecordDto: FixRecordDto) {
    return this.classService.fixRecord(id, fixRecordDto);
  }

  // getClassBasic
  @ApiOperation({summary:"获取班组id和名称"})
  @Get('basic')
  findAllClass() {
    return this.classService.findAllClass();
  }

  @ApiOperation({summary:"获取父级班组id和名称"})
  @Get('basic/selector')
  findClassSelector() {
    return this.classService.findClassSelector();
  }

  @ApiOperation({summary:"获取子级班组id和名称"})
  @Get('basic/leaf')
  findClassLeaf() {
    return this.classService.findClassLeaf();
  }

  // class
  @ApiOperation({summary:"获取带有检查信息的班组列表"})
  @Get('checkStatus')
  findAllClassWithCheckStatus(@Query('keyword') keyword: string) {
    return this.classService.findAllClassWithCheckStatus(keyword);
  }

  @ApiOperation({summary:"获取带有检查信息的父级班组列表"})
  @Get('parentCheckStatus')
  findParentClassWithCheckStatus() {
    return this.classService.findParentClassWithCheckStatus();
  }

  @ApiOperation({summary:"新增班组"})
  @Post()
  createClass(@Body() createClassDto: CreateClassDto) {
    return this.classService.createClass(createClassDto);
  }

  @ApiOperation({summary:"更新班组信息"})
  @Put(':id')
  updateClass(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classService.updateClass(id, updateClassDto);
  }

  @ApiOperation({summary:"删除班组"})
  @Delete(':id')
  deleteClass(@Param('id') id: string) {
    return this.classService.deleteClass(id);
  }

  @ApiOperation({summary:"获取班组信息"})
  @Get(':id')
  findOneClass(@Param('id') id: string) {
    return this.classService.findOneClass(id);
  }
}
