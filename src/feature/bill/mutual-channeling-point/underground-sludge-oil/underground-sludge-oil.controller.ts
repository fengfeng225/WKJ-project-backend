import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { UndergroundSludgeOilService } from './underground-sludge-oil.service';
import { CreateUndergroundSludgeOilDto } from './dto/create-underground-sludge-oil.dto';
import { UpdateUndergroundSludgeOilDto } from './dto/update-underground-sludge-oil.dto';
import { FindDto } from '../../dto/find.dto';
import { ApiQuery, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from 'src/decorators/require-permission';

@ApiTags('underground-sludge-oil')
@ApiBearerAuth()
@Controller('admin/mutualChannelingPoint/undergroundSludgeOilBill')
export class UndergroundSludgeOilController {
  constructor(private readonly undergroundSludgeOilService: UndergroundSludgeOilService) {}

  @ApiOperation({summary:"获取全部地下污油"})
  @RequirePermission({
    requireMenu: (context) => 'undergroundSludgeOil',
    requireButton: 'btn_export'
  })
  @Get('all')
  findAllUndergroundSludgeOilBill() {
    return this.undergroundSludgeOilService.findAllUndergroundSludgeOilBill();
  }

  @ApiOperation({summary:"获取地下污油"})
  @ApiQuery({name: 'classId', required: false})
  @ApiQuery({name: 'keyword', required: false})
  @ApiQuery({name: 'currentPage', required: false})
  @ApiQuery({name: 'pageSize', required: false})
  @ApiQuery({name: 'queryJson', required: false})
  @RequirePermission({
    requireMenu: (context) => 'undergroundSludgeOil',
    requireButton: null
  })
  @Get()
  findUndergroundSludgeOilBill(@Query() findDto: FindDto) {
    return this.undergroundSludgeOilService.findUndergroundSludgeOilBill(findDto);
  }

  @ApiOperation({summary:"新增地下污油"})
  @RequirePermission({
    requireMenu: (context) => 'undergroundSludgeOil',
    requireButton: 'btn_add'
  })
  @Post()
  create(@Body() createUndergroundSludgeOilDto: CreateUndergroundSludgeOilDto) {
    return this.undergroundSludgeOilService.create(createUndergroundSludgeOilDto);
  }

  @ApiOperation({summary:"获取地下污油信息"})
  @RequirePermission({
    requireMenu: (context) => 'undergroundSludgeOil',
    requireButton: 'btn_edit'
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.undergroundSludgeOilService.findOne(id);
  }

  @ApiOperation({summary:"修改地下污油信息"})
  @RequirePermission({
    requireMenu: (context) => 'undergroundSludgeOil',
    requireButton: 'btn_edit'
  })
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUndergroundSludgeOilDto: UpdateUndergroundSludgeOilDto) {
    return this.undergroundSludgeOilService.update(id, updateUndergroundSludgeOilDto);
  }

  @ApiOperation({summary:"删除地下污油"})
  @RequirePermission({
    requireMenu: (context) => 'undergroundSludgeOil',
    requireButton: 'btn_delete'
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.undergroundSludgeOilService.remove(id);
  }
}
