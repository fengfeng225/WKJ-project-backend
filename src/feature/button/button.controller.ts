import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ButtonService } from './button.service';
import { CreateButtonDto } from './dto/create-button.dto';
import { UpdateButtonDto } from './dto/update-button.dto';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('button')
@ApiBearerAuth()
@Controller('system/menuButton')
export class ButtonController {
  constructor(private readonly buttonService: ButtonService) {}

  @ApiOperation({summary:"新增按钮"})
  @Post()
  create(@Body() createButtonDto: CreateButtonDto) {
    return this.buttonService.create(createButtonDto);
  }

  @ApiOperation({summary:"获取当前菜单的按钮列表"})
  @Get('list/:id')
  findAll(@Param('id') id:string) {
    return this.buttonService.findAll(id);
  }

  @ApiOperation({summary:"获取按钮信息"})
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.buttonService.findOne(+id);
  }

  @ApiOperation({summary:"更新按钮"})
  @Put(':id')
  update(@Param('id') id: number, @Body() updateButtonDto: UpdateButtonDto) {
    return this.buttonService.update(+id, updateButtonDto);
  }

  @ApiOperation({summary:"删除按钮"})
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.buttonService.remove(+id);
  }
}
