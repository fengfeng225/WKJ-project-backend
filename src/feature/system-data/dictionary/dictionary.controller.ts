import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from 'src/decorators/require-permission';

@ApiTags('dictionary')
@ApiBearerAuth()
@Controller('admin/systemData/dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @ApiOperation({summary:"根据编码获取选项列表"})
  @Get('optionsByCode/:code')
  findAllOptionByCode(@Param('code') code: string) {
    return this.dictionaryService.findAllOptionByCode(code);
  }
  
  // 选项
  @ApiOperation({summary:"新增选项"})
  @RequirePermission('admin')
  @Post('option')
  createOption(@Body() createOptionDto: CreateOptionDto) {
    return this.dictionaryService.createOption(createOptionDto);
  }

  @ApiOperation({summary:"获取选项列表"})
  @RequirePermission('admin')
  @Get(':id/option')
  findAllOption(@Param('id') id: string, @Query('keyword') keyword: string) {
    return this.dictionaryService.findAllOption(id, keyword);
  }

  @ApiOperation({summary:"获取选项信息"})
  @RequirePermission('admin')
  @Get('option/:id')
  findOneOption(@Param('id') id: string) {
    return this.dictionaryService.findOneOption(id);
  }

  @ApiOperation({summary:"更新选项"})
  @RequirePermission('admin')
  @Put('option/:id')
  updateOption(@Param('id') id: string, @Body() updateOptionDto: UpdateOptionDto) {
    return this.dictionaryService.updateOption(id, updateOptionDto);
  }

  @ApiOperation({summary:"删除选项"})
  @RequirePermission('admin')
  @Delete('option/:id')
  removeOption(@Param('id') id: string) {
    return this.dictionaryService.removeOption(id);
  }

  
  // 字段
  @ApiOperation({summary:"新增字段"})
  @RequirePermission('admin')
  @Post()
  createDictionary(@Body() createDictionaryDto: CreateDictionaryDto) {
    return this.dictionaryService.createDictionary(createDictionaryDto);
  }

  @ApiOperation({summary:"获取字段列表"})
  @RequirePermission('admin')
  @Get()
  findAllDictionary() {
    return this.dictionaryService.findAllDictionary();
  }

  @ApiOperation({summary:"获取字段信息"})
  @RequirePermission('admin')
  @Get(':id')
  findOneDictionary(@Param('id') id: string) {
    return this.dictionaryService.findOneDictionary(id);
  }

  @ApiOperation({summary:"更新字段"})
  @RequirePermission('admin')
  @Put(':id')
  updateDictionary(@Param('id') id: string, @Body() updateDictionaryDto: UpdateDictionaryDto) {
    return this.dictionaryService.updateDictionary(id, updateDictionaryDto);
  }

  @ApiOperation({summary:"删除字段"})
  @RequirePermission('admin')
  @Delete(':id')
  removeDictionary(@Param('id') id: string) {
    return this.dictionaryService.removeDictionary(id);
  }
}
