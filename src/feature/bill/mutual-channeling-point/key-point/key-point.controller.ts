import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { KeyPointService } from './key-point.service';
import { CreateKeyPointDto } from './dto/create-key-point.dto';
import { UpdateKeyPointDto } from './dto/update-key-point.dto';
import { FindDto } from '../common-dto/find.dto';
import { ApiQuery, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from 'src/decorators/require-permission';

@ApiTags('key-point')
@ApiBearerAuth()
@Controller('admin/mutualChannelingPoint/keyPointBill')
export class KeyPointController {
  constructor(private readonly keyPointService: KeyPointService) {}

  @ApiOperation({summary:"获取全部关键点"})
  @RequirePermission({
    requireMenu: (context) => 'KeyPoint',
    requireButton: 'btn_export'
  })
  @Get('all')
  findAllKeyPointBill() {
    return this.keyPointService.findAllKeyPointBill();
  }

  @ApiOperation({summary:"获取关键点"})
  @ApiQuery({name: 'classId', required: false})
  @ApiQuery({name: 'keyword', required: false})
  @ApiQuery({name: 'currentPage', required: false})
  @ApiQuery({name: 'pageSize', required: false})
  @ApiQuery({name: 'queryJson', required: false})
  @RequirePermission({
    requireMenu: (context) => 'KeyPoint',
    requireButton: null
  })
  @Get()
  findKeyPointBill(@Query() findDto: FindDto) {
    return this.keyPointService.findKeyPointBill(findDto);
  }

  @ApiOperation({summary:"新增关键点"})
  @RequirePermission({
    requireMenu: (context) => 'KeyPoint',
    requireButton: 'btn_add'
  })
  @Post()
  create(@Body() createKeyPointDto: CreateKeyPointDto) {
    return this.keyPointService.create(createKeyPointDto);
  }

  @ApiOperation({summary:"获取关键点信息"})
  @RequirePermission({
    requireMenu: (context) => 'KeyPoint',
    requireButton: 'btn_edit'
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.keyPointService.findOne(id);
  }

  @ApiOperation({summary:"修改关键点信息"})
  @RequirePermission({
    requireMenu: (context) => 'KeyPoint',
    requireButton: 'btn_edit'
  })
  @Put(':id')
  update(@Param('id') id: string, @Body() updateKeyPointDto: UpdateKeyPointDto) {
    return this.keyPointService.update(id, updateKeyPointDto);
  }

  @ApiOperation({summary:"删除关键点"})
  @RequirePermission({
    requireMenu: (context) => 'KeyPoint',
    requireButton: 'btn_delete'
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.keyPointService.remove(id);
  }
}
