import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindRoleAuthorizeDto } from './dto/find-roleAuthorize.dto';
import { UpdateRoleAuthorizeDto } from './dto/update-roleAuthorize.dto';
import { UpdateClassAuthorizeDto } from './dto/update-classAuthorize.dto';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from 'src/decorators/require-permission';

@ApiTags('role')
@ApiBearerAuth()
@RequirePermission('admin')
@Controller('permission/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({summary:"获取角色权限"})
  @Get('Authorize/:id')
  findAllAuthorize(@Param('id') id: string, @Query() findRoleAuthorizeDto: FindRoleAuthorizeDto) {    
    return this.roleService.findAllAuthorize(id, findRoleAuthorizeDto);
  }

  @ApiOperation({summary:"更新角色权限"})
  @Put('Authorize/:id')
  updateAuthorize(@Param('id') id: string, @Body() updateRoleAuthorizeDto: UpdateRoleAuthorizeDto) {
    return this.roleService.updateAuthorize(id, updateRoleAuthorizeDto);
  }

  @ApiOperation({summary:"获取角色班组权限"})
  @Get('classAuthorize/:id')
  findClassAuthorize(@Param('id') id: string) {    
    return this.roleService.findClassAuthorize(id);
  }

  @ApiOperation({summary:"更新角色班组权限"})
  @Put('classAuthorize/:id')
  updateClassAuthorize(@Param('id') id: string, @Body() updateClassAuthorizeDto: UpdateClassAuthorizeDto) {
    return this.roleService.updateClassAuthorize(id, updateClassAuthorizeDto);
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
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @ApiOperation({summary:"更新角色"})
  @Put(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @ApiOperation({summary:"删除角色"})
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
