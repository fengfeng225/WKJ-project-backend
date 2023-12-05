import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ColumnService } from './column.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from 'src/decorators/require-permission';

@ApiTags('column')
@ApiBearerAuth()
@RequirePermission('admin')
@Controller('system/menuColumn')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @ApiOperation({summary:"新增表格列"})
  @Post()
  create(@Body() createColumnDto: CreateColumnDto) {
    return this.columnService.create(createColumnDto);
  }

  @ApiOperation({summary:"批量新增表格列"})
  @Post('batchCreate/:menuId')
  batchCreate(@Body() columnData, @Param('menuId') menuId: string) {
    return this.columnService.batchCreate(menuId, columnData);
  }

  @ApiOperation({summary:"获取当前菜单的表格列列表"})
  @Get('list/:id')
  findAll(@Param('id') id:string) {
    return this.columnService.findAll(id);
  }

  @ApiOperation({summary:"获取表格列信息"})
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.columnService.findOne(id);
  }

  @ApiOperation({summary:"更新表格列"})
  @Put(':id')
  update(@Param('id') id: string, @Body() updateColumnDto: UpdateColumnDto) {
    return this.columnService.update(id, updateColumnDto);
  }

  @ApiOperation({summary:"删除表格列"})
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.columnService.remove(id);
  }


}
