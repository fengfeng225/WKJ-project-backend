import { Controller, Get, Post, Body, Put, Param, Query, Delete } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ApiQuery, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from 'src/decorators/require-permission';

@ApiTags('menu')
@ApiBearerAuth()
@RequirePermission('admin')
@Controller('system/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({summary:"获取菜单列表"})
  @ApiQuery({name: 'keyword', required: false})
  @Get('list')
  findAll(@Query('keyword')  keyword: string) {
    return this.menuService.findAll(keyword);
  }

  @ApiOperation({summary:"获取目录"})
  @Get('selector/:id')
  getSelector(@Param('id') id: string) {
    return this.menuService.getSelector(id);
  }

  @ApiOperation({summary:"新建菜单"})
  @Post()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @ApiOperation({summary:"菜单信息"})
  @Get('info/:id')
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @ApiOperation({summary:"更新菜单"})
  @Put(':id')
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.update(id, updateMenuDto);
  }

  @ApiOperation({summary:"删除菜单"})
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
