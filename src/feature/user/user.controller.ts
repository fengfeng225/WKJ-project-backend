import { Controller, Get, Put, Body, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { RequireLogin } from 'src/decorators/require-login';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 添加测试数据接口
  @RequireLogin()
  @Get('init')
  async initData() {
    await this.userService.initData();
    return 'done';
  }

  // 更改密码
  @ApiOperation({summary:"更改用户密码"})
  @ApiBody({
    type: UpdateUserDto
  })
  @Put('updatePassword')
  getProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updatePassword(req.user.userId, updateUserDto)
  }
}
