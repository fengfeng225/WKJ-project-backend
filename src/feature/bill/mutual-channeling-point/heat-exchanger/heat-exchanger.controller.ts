import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { HeatExchangerService } from './heat-exchanger.service';
import { CreateHeatExchangerDto } from './dto/create-heat-exchanger.dto';
import { UpdateHeatExchangerDto } from './dto/update-heat-exchanger.dto';
import { FindDto } from '../common-dto/find.dto';
import { ApiQuery, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from 'src/decorators/require-permission';

@ApiTags('heat-exchanger')
@ApiBearerAuth()
@Controller('admin/mutualChannelingPoint/heatExchangerBill')
export class HeatExchangerController {
  constructor(private readonly heatExchangerService: HeatExchangerService) {}

  @ApiOperation({summary:"获取全部换热器"})
  @RequirePermission({
    requireMenu: (context) => 'heatExchanger',
    requireButton: 'btn_export'
  })
  @Get('all')
  findAllHeatExchangerBill() {
    return this.heatExchangerService.findAllHeatExchangerBill();
  }

  @ApiOperation({summary:"获取换热器"})
  @ApiQuery({name: 'classId', required: false})
  @ApiQuery({name: 'keyword', required: false})
  @ApiQuery({name: 'currentPage', required: false})
  @ApiQuery({name: 'pageSize', required: false})
  @ApiQuery({name: 'queryJson', required: false})
  @RequirePermission({
    requireMenu: (context) => 'heatExchanger',
    requireButton: null
  })
  @Get()
  findHeatExchangerBill(@Query() findDto: FindDto) {
    return this.heatExchangerService.findHeatExchangerBill(findDto);
  }

  @ApiOperation({summary:"新增换热器"})
  @RequirePermission({
    requireMenu: (context) => 'heatExchanger',
    requireButton: 'btn_add'
  })
  @Post()
  create(@Body() createHeatExchangerDto: CreateHeatExchangerDto) {
    return this.heatExchangerService.create(createHeatExchangerDto);
  }

  @ApiOperation({summary:"获取换热器信息"})
  @RequirePermission({
    requireMenu: (context) => 'heatExchanger',
    requireButton: 'btn_edit'
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.heatExchangerService.findOne(id);
  }

  @ApiOperation({summary:"修改换热器信息"})
  @RequirePermission({
    requireMenu: (context) => 'heatExchanger',
    requireButton: 'btn_edit'
  })
  @Put(':id')
  update(@Param('id') id: string, @Body() updateHeatExchangerDto: UpdateHeatExchangerDto) {
    return this.heatExchangerService.update(id, updateHeatExchangerDto);
  }

  @ApiOperation({summary:"删除换热器"})
  @RequirePermission({
    requireMenu: (context) => 'heatExchanger',
    requireButton: 'btn_delete'
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.heatExchangerService.remove(id);
  }
}
