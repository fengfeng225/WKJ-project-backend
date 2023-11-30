import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindRoleAuthorizeDto } from './dto/find-roleAuthorize.dto';
import { UpdateRoleAuthorizeDto } from './dto/update-roleAuthorize.dto';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('role')
@ApiBearerAuth()
@Controller('permission/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({summary:"获取角色权限"})
  @Get('Authorize/:id')
  findAllAuthorize(@Param('id') id: number, @Query() findRoleAuthorizeDto: FindRoleAuthorizeDto) {
    return this.roleService.findAllAuthorize(id, findRoleAuthorizeDto);
  }

  @ApiOperation({summary:"更新角色权限"})
  @Put('Authorize/:id')
  updateAuthorize(@Param('id') id: number, @Body() updateRoleAuthorizeDto: UpdateRoleAuthorizeDto) {
    return this.roleService.updateAuthorize(id, updateRoleAuthorizeDto);
  }
  
  @ApiOperation({summary:"新增角色"})
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @ApiOperation({summary:"获取角色列表"})
  @Get()
  findAll(@Query('keyword') keyword: string) {
    return this.roleService.findAll(keyword);
  }

  @ApiOperation({summary:"获取角色信息"})
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.roleService.findOne(+id);
  }

  @ApiOperation({summary:"更新角色"})
  @Put(':id')
  update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @ApiOperation({summary:"删除角色"})
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.roleService.remove(+id);
  }
}
