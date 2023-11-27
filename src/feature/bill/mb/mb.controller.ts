import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { MbService } from './mb.service';
import { CreateMbDto } from './dto/create-mb.dto';
import { UpdateMbDto } from './dto/update-mb.dto';
import { RequireLogin } from 'src/decorators/require-login';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('mb')
@ApiBearerAuth()
@Controller('admin/mb')
@Controller('mb')
export class MbController {
  constructor(private readonly mbService: MbService) {}

  @RequireLogin()
  @Get('init')
  async initClass() {
    await this.mbService.initClass()
    return 'done'
  }

  @ApiOperation({summary:"获取短期盲板"})
  @Get('shortBill')
  findAll() {
    return this.mbService.findAll();
  }

  @Post()
  create(@Body() createMbDto: CreateMbDto) {
    return this.mbService.create(createMbDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mbService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMbDto: UpdateMbDto) {
    return this.mbService.update(+id, updateMbDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mbService.remove(+id);
  }
}
