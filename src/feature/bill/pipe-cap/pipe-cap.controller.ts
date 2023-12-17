import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { PipeCapService } from './pipe-cap.service';
import { CreatePipeCapDto } from './dto/create-pipe-cap.dto';
import { UpdatePipeCapDto } from './dto/update-pipe-cap.dto';
import { FindDto } from '../dto/find.dto';
import { ApiQuery, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from 'src/decorators/require-permission';

@ApiTags('pipe-cap')
@ApiBearerAuth()
@Controller('admin/pipeCap/bill')
export class PipeCapController {
  constructor(private readonly pipeCapService: PipeCapService) {}

  @ApiOperation({summary:"获取全部管帽"})
  @RequirePermission({
    requireMenu: (context) => 'pipeCap',
    requireButton: 'btn_export'
  })
  @Get('all')
  findAllPipeCapBill() {
    return this.pipeCapService.findAllPipeCapBill();
  }

  @ApiOperation({summary:"获取管帽"})
  @ApiQuery({name: 'classId', required: false})
  @ApiQuery({name: 'keyword', required: false})
  @ApiQuery({name: 'currentPage', required: false})
  @ApiQuery({name: 'pageSize', required: false})
  @ApiQuery({name: 'queryJson', required: false})
  @RequirePermission({
    requireMenu: (context) => 'pipeCap',
    requireButton: null
  })
  @Get()
  findPipeCapBill(@Query() findDto: FindDto) {
    return this.pipeCapService.findPipeCapBill(findDto);
  }

  @ApiOperation({summary:"新增管帽"})
  @RequirePermission({
    requireMenu: (context) => 'pipeCap',
    requireButton: 'btn_add'
  })
  @Post()
  create(@Body() createPipeCapDto: CreatePipeCapDto) {
    return this.pipeCapService.create(createPipeCapDto);
  }

  @ApiOperation({summary:"获取管帽信息"})
  @RequirePermission({
    requireMenu: (context) => 'pipeCap',
    requireButton: 'btn_edit'
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pipeCapService.findOne(id);
  }

  @ApiOperation({summary:"修改管帽信息"})
  @RequirePermission({
    requireMenu: (context) => 'pipeCap',
    requireButton: 'btn_edit'
  })
  @Put(':id')
  update(@Param('id') id: string, @Body() updatePipeCapDto: UpdatePipeCapDto) {
    return this.pipeCapService.update(id, updatePipeCapDto);
  }

  @ApiOperation({summary:"删除管帽"})
  @RequirePermission({
    requireMenu: (context) => 'pipeCap',
    requireButton: 'btn_delete'
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pipeCapService.remove(id);
  }
}
