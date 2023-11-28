import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { ApiQuery, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

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
  @Post('option')
  createOption(@Body() createOptionDto: CreateOptionDto) {
    return this.dictionaryService.createOption(createOptionDto);
  }

  @ApiOperation({summary:"获取选项列表"})
  @Get(':id/option')
  findAllOption(@Param('id') id: number, @Query('keyword') keyword: string) {
    return this.dictionaryService.findAllOption(+id, keyword);
  }

  @ApiOperation({summary:"获取选项信息"})
  @Get('option/:id')
  findOneOption(@Param('id') id: number) {
    return this.dictionaryService.findOneOption(+id);
  }

  @ApiOperation({summary:"更新选项"})
  @Put('option/:id')
  updateOption(@Param('id') id: number, @Body() updateOptionDto: UpdateOptionDto) {
    return this.dictionaryService.updateOption(+id, updateOptionDto);
  }

  @ApiOperation({summary:"删除选项"})
  @Delete('option/:id')
  removeOption(@Param('id') id: number) {
    return this.dictionaryService.removeOption(+id);
  }

  
  // 字段
  @ApiOperation({summary:"新增字段"})
  @Post()
  createDictionary(@Body() createDictionaryDto: CreateDictionaryDto) {
    return this.dictionaryService.createDictionary(createDictionaryDto);
  }

  @ApiOperation({summary:"获取字段列表"})
  @Get()
  findAllDictionary() {
    return this.dictionaryService.findAllDictionary();
  }

  @ApiOperation({summary:"获取字段信息"})
  @Get(':id')
  findOneDictionary(@Param('id') id: number) {
    return this.dictionaryService.findOneDictionary(+id);
  }

  @ApiOperation({summary:"更新字段"})
  @Put(':id')
  updateDictionary(@Param('id') id: number, @Body() updateDictionaryDto: UpdateDictionaryDto) {
    return this.dictionaryService.updateDictionary(+id, updateDictionaryDto);
  }

  @ApiOperation({summary:"删除字段"})
  @Delete(':id')
  removeDictionary(@Param('id') id: number) {
    return this.dictionaryService.removeDictionary(+id);
  }
}
