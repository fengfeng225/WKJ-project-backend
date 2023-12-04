import { Controller, Get, Put, Body, Request, Query, Post, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { RequireLogin } from 'src/decorators/require-login';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { FindAllDto } from './dto/findAll-dto';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';

@ApiTags('user')
@ApiBearerAuth()
@Controller('permission/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  // 添加测试数据接口
  @RequireLogin()
  @Get('init')
  async initData() {
    await this.userService.initData();
    return 'done';
  }

  @ApiOperation({summary:"更改用户密码"})
  @Put('updatePassword')
  updatePassword(@Request() req, @Body() updateUserPasswordDto: UpdateUserPasswordDto) {
    return this.userService.updatePassword(req.user.userId, updateUserPasswordDto)
  }

  @ApiOperation({summary:"重置用户密码"})
  @Put('resetPassword/:id')
  resetPassword(@Param('id') id: string, @Body() resetUserPasswordDto: ResetUserPasswordDto) {
    return this.userService.resetPassword(id, resetUserPasswordDto)
  }

  @ApiOperation({summary:"获取用户列表"})
  @Get()
  findAll(@Query() findAllDto: FindAllDto) {
    return this.userService.findAll(findAllDto)
  }

  @ApiOperation({summary:"新增用户"})
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @ApiOperation({summary:"更新用户信息"})
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto)
  }

  @ApiOperation({summary:"获取用户信息"})
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id)
  }

  @ApiOperation({summary:"删除用户"})
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id)
  }
}
