import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ContainerService } from './container.service';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/update-container.dto';
import { FindDto } from '../common-dto/find.dto';
import { ApiQuery, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from 'src/decorators/require-permission';

@ApiTags('container')
@ApiBearerAuth()
@Controller('admin/mutualChannelingPoint/containerBill')
export class ContainerController {
  constructor(private readonly containerService: ContainerService) {}

  @ApiOperation({summary:"获取全部容器"})
  @RequirePermission({
    requireMenu: (context) => 'container',
    requireButton: 'btn_export'
  })
  @Get('all')
  findAllContainerBill() {
    return this.containerService.findAllContainerBill();
  }

  @ApiOperation({summary:"获取容器"})
  @ApiQuery({name: 'classId', required: false})
  @ApiQuery({name: 'keyword', required: false})
  @ApiQuery({name: 'currentPage', required: false})
  @ApiQuery({name: 'pageSize', required: false})
  @ApiQuery({name: 'queryJson', required: false})
  @RequirePermission({
    requireMenu: (context) => 'container',
    requireButton: null
  })
  @Get()
  findContainerBill(@Query() findDto: FindDto) {
    return this.containerService.findContainerBill(findDto);
  }

  @ApiOperation({summary:"新增容器"})
  @RequirePermission({
    requireMenu: (context) => 'container',
    requireButton: 'btn_add'
  })
  @Post()
  create(@Body() createContainerDto: CreateContainerDto) {
    return this.containerService.create(createContainerDto);
  }

  @ApiOperation({summary:"获取容器信息"})
  @RequirePermission({
    requireMenu: (context) => 'container',
    requireButton: 'btn_edit'
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.containerService.findOne(id);
  }

  @ApiOperation({summary:"修改容器信息"})
  @RequirePermission({
    requireMenu: (context) => 'container',
    requireButton: 'btn_edit'
  })
  @Put(':id')
  update(@Param('id') id: string, @Body() updateContainerDto: UpdateContainerDto) {
    return this.containerService.update(id, updateContainerDto);
  }

  @ApiOperation({summary:"删除容器"})
  @RequirePermission({
    requireMenu: (context) => 'container',
    requireButton: 'btn_delete'
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.containerService.remove(id);
  }
}
