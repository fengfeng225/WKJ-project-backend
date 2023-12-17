import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { OtherPointService } from './other-point.service';
import { CreateOtherPointDto } from './dto/create-other-point.dto';
import { UpdateOtherPointDto } from './dto/update-other-point.dto';
import { FindDto } from '../../dto/find.dto';
import { ApiQuery, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from 'src/decorators/require-permission';

@ApiTags('other-point')
@ApiBearerAuth()
@Controller('admin/mutualChannelingPoint/otherPointBill')
export class OtherPointController {
  constructor(private readonly otherPointService: OtherPointService) {}

  @ApiOperation({summary:"获取全部其他互窜点"})
  @RequirePermission({
    requireMenu: (context) => 'otherPoint',
    requireButton: 'btn_export'
  })
  @Get('all')
  findAllOtherPointBill() {
    return this.otherPointService.findAllOtherPointBill();
  }

  @ApiOperation({summary:"获取其他互窜点"})
  @ApiQuery({name: 'classId', required: false})
  @ApiQuery({name: 'keyword', required: false})
  @ApiQuery({name: 'currentPage', required: false})
  @ApiQuery({name: 'pageSize', required: false})
  @ApiQuery({name: 'queryJson', required: false})
  @RequirePermission({
    requireMenu: (context) => 'otherPoint',
    requireButton: null
  })
  @Get()
  findOtherPointBill(@Query() findDto: FindDto) {
    return this.otherPointService.findOtherPointBill(findDto);
  }

  @ApiOperation({summary:"新增其他互窜点"})
  @RequirePermission({
    requireMenu: (context) => 'otherPoint',
    requireButton: 'btn_add'
  })
  @Post()
  create(@Body() createOtherPointDto: CreateOtherPointDto) {
    return this.otherPointService.create(createOtherPointDto);
  }

  @ApiOperation({summary:"获取其他互窜点信息"})
  @RequirePermission({
    requireMenu: (context) => 'otherPoint',
    requireButton: 'btn_edit'
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.otherPointService.findOne(id);
  }

  @ApiOperation({summary:"修改其他互窜点信息"})
  @RequirePermission({
    requireMenu: (context) => 'otherPoint',
    requireButton: 'btn_edit'
  })
  @Put(':id')
  update(@Param('id') id: string, @Body() updateOtherPointDto: UpdateOtherPointDto) {
    return this.otherPointService.update(id, updateOtherPointDto);
  }

  @ApiOperation({summary:"删除其他互窜点"})
  @RequirePermission({
    requireMenu: (context) => 'otherPoint',
    requireButton: 'btn_delete'
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.otherPointService.remove(id);
  }
}
