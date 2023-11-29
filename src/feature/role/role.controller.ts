import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindRoleDto } from './dto/find-role.dto';
import { FindRoleAuthorizeDto } from './dto/find-roleAuthorize.dto';
import { UpdateRoleAuthorizeDto } from './dto/update-roleAuthorize.dto';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('role')
@ApiBearerAuth()
@Controller('permission/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({summary:"获取角色权限"})
  @Get('Authorize')
  findAllAuthorize(@Query() findRoleAuthorizeDto: FindRoleAuthorizeDto) {
    return this.roleService.findAllAuthorize(findRoleAuthorizeDto);
  }

  @ApiOperation({summary:"更新角色权限"})
  @Get('Authorize/:id')
  updateAuthorize(@Param('id') id: number, @Body() updateRoleAuthorizeDto: UpdateRoleAuthorizeDto) {
    return this.roleService.updateAuthorize(updateRoleAuthorizeDto);
  }
  
  @ApiOperation({summary:"新增角色"})
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @ApiOperation({summary:"获取角色列表"})
  @Get()
  findAll(@Query() findRoleDto: FindRoleDto) {
    return this.roleService.findAll(findRoleDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.roleService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.roleService.remove(+id);
  }
}
