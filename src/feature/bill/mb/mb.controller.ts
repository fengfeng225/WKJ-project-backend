import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { MbService } from './mb.service';
import { CreateMbDto } from './dto/create-mb.dto';
import { UpdateMbDto } from './dto/update-mb.dto';
import { FindAllMbDto } from './dto/findAll-mb.dto';
import { RequireLogin } from 'src/decorators/require-login';
import { ApiQuery, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('mb')
@ApiBearerAuth()
@Controller('admin/mb')
@Controller('mb')
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
  @Get('shortBill')
  findAllShortBill(@Query() findAllMbDto: FindAllMbDto) {
    return this.mbService.findAllShortBill(findAllMbDto);
  }

  @ApiOperation({summary:"新增短期盲板"})
  @Post('shortBill')
  createShortBill(@Body() createMbDto: CreateMbDto) {
    return this.mbService.createShortBill(createMbDto);
  }

  @ApiOperation({summary:"获取短期盲板信息"})
  @Get('shortBill/:id')
  findOneShortBill(@Param('id') id: number) {
    return this.mbService.findOneShortBill(+id);
  }

  @ApiOperation({summary:"更新短期盲板"})
  @Put('shortBill/:id')
  updateShortBill(@Param('id') id: number, @Body() updateMbDto: UpdateMbDto) {
    return this.mbService.updateShortBill(+id, updateMbDto);
  }

  @ApiOperation({summary:"删除短期盲板"})
  @Delete('shortBill/:id')
  removeShortBill(@Param('id') id: number) {
    return this.mbService.removeShortBill(+id);
  }

  // longBill

  // class
  @ApiOperation({summary:"获取班组列表"})
  @Get('class')
  findAllClass() {
    return this.mbService.findAllClass();
  }
}
