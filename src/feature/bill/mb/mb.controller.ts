import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { MbService } from './mb.service';
import { CreateMbDto } from './dto/create-mb.dto';
import { UpdateMbDto } from './dto/update-mb.dto';
import { FindAllMbDto } from './dto/findAll-mb.dto';
import { RequireLogin } from 'src/decorators/require-login';
import { ApiQuery, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from 'src/decorators/require-permission';

@ApiTags('mb')
@ApiBearerAuth()
@Controller('admin/mb')
export class MbController {
  constructor(private readonly mbService: MbService) {}
  // 初始化测试数据
  @RequireLogin()
  @Get('init')
  async initClass() {
    await this.mbService.initClass()
    return 'done'
  }

  // shortBill
  @ApiOperation({summary:"获取短期盲板"})
  @ApiQuery({name: 'classId', required: false})
  @ApiQuery({name: 'keyword', required: false})
  @ApiQuery({name: 'currentPage', required: false})
  @ApiQuery({name: 'pageSize', required: false})
  @ApiQuery({name: 'queryJson', required: false})
  @RequirePermission({
    requireMenu: 'shortBill',
    requireButton: null
  })
  @Get('shortBill')
  findShortBill(@Query() findAllMbDto: FindAllMbDto) {
    return this.mbService.findShortBill(findAllMbDto);
  }

  @ApiOperation({summary:"获取全部短期盲板"})
  @RequirePermission({
    requireMenu: 'shortBill',
    requireButton: 'btn_export'
  })
  @Get('allShortBill')
  findAllShortBill() {
    return this.mbService.findAllShortBill();
  }

  @ApiOperation({summary:"新增短期盲板"})
  @RequirePermission({
    requireMenu: 'shortBill',
    requireButton: 'btn_add'
  })
  @Post('shortBill')
  createShortBill(@Body() createMbDto: CreateMbDto) {
    return this.mbService.createShortBill(createMbDto);
  }

  @ApiOperation({summary:"获取短期盲板信息"})
  @RequirePermission({
    requireMenu: 'shortBill',
    requireButton: 'btn_edit'
  })
  @Get('shortBill/:id')
  findOneShortBill(@Param('id') id: string) {
    return this.mbService.findOneShortBill(id);
  }

  @ApiOperation({summary:"更新短期盲板"})
  @RequirePermission({
    requireMenu: 'shortBill',
    requireButton: 'btn_edit'
  })
  @Put('shortBill/:id')
  updateShortBill(@Param('id') id: string, @Body() updateMbDto: UpdateMbDto) {
    return this.mbService.updateShortBill(id, updateMbDto);
  }

  @ApiOperation({summary:"删除短期盲板"})
  @RequirePermission({
    requireMenu: 'shortBill',
    requireButton: 'btn_delete'
  })
  @Delete('shortBill/:id')
  removeShortBill(@Param('id') id: string) {
    return this.mbService.removeShortBill(id);
  }


  // longBill
  @ApiOperation({summary:"获取长期盲板"})
  @ApiQuery({name: 'classId', required: false})
  @ApiQuery({name: 'keyword', required: false})
  @ApiQuery({name: 'currentPage', required: false})
  @ApiQuery({name: 'pageSize', required: false})
  @ApiQuery({name: 'queryJson', required: false})
  @RequirePermission({
    requireMenu: 'longBill',
    requireButton: null
  })
  @Get('longBill')
  findLongBill(@Query() findAllMbDto: FindAllMbDto) {
    return this.mbService.findLongBill(findAllMbDto);
  }

  @ApiOperation({summary:"获取全部长期盲板"})
  @RequirePermission({
    requireMenu: 'longBill',
    requireButton: 'btn_export'
  })
  @Get('allLongBill')
  findAllLongBill() {
    return this.mbService.findAllLongBill();
  }

  @ApiOperation({summary:"新增长期盲板"})
  @RequirePermission({
    requireMenu: 'longBill',
    requireButton: 'btn_add'
  })
  @Post('longBill')
  createLongBill(@Body() createMbDto: CreateMbDto) {
    return this.mbService.createLongBill(createMbDto);
  }

  @ApiOperation({summary:"获取长期盲板信息"})
  @RequirePermission({
    requireMenu: 'longBill',
    requireButton: 'btn_edit'
  })
  @Get('longBill/:id')
  findOneLongBill(@Param('id') id: string) {
    return this.mbService.findOneLongBill(id);
  }

  @ApiOperation({summary:"更新长期盲板"})
  @RequirePermission({
    requireMenu: 'longBill',
    requireButton: 'btn_edit'
  })
  @Put('longBill/:id')
  updateLongBill(@Param('id') id: string, @Body() updateMbDto: UpdateMbDto) {
    return this.mbService.updateLongBill(id, updateMbDto);
  }

  @ApiOperation({summary:"删除长期盲板"})
  @RequirePermission({
    requireMenu: 'longBill',
    requireButton: 'btn_delete'
  })
  @Delete('longBill/:id')
  removeLongBill(@Param('id') id: string) {
    return this.mbService.removeLongBill(id);
  }


  // disassembly
  @ApiOperation({summary:"获取拆装明细"})
  @ApiQuery({name: 'classId', required: false})
  @ApiQuery({name: 'keyword', required: false})
  @ApiQuery({name: 'currentPage', required: false})
  @ApiQuery({name: 'pageSize', required: false})
  @RequirePermission({
    requireMenu: 'disassemblyDetails',
    requireButton: null
  })
  @Get('bill/disassembleDetails')
  findDisassembleDetails(@Query() findAllMbDto: FindAllMbDto) {
    return this.mbService.findDisassembleDetails(findAllMbDto);
  }

  @ApiOperation({summary:"删除拆装明细"})
  @RequirePermission({
    requireMenu: 'disassemblyDetails',
    requireButton: 'btn_delete'
  })
  @Delete('bill/disassembleDetail/:id')
  removeDisassembleDetail(@Param('id') id: string) {
    return this.mbService.removeDisassembleDetail(id);
  }

  // class
  @ApiOperation({summary:"获取班组列表"})
  @Get('class')
  findAllClass() {
    return this.mbService.findAllClass();
  }

  // checkRecord
  
}
