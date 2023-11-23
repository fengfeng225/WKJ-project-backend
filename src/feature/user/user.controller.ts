import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { RequireLogin } from 'src/common/decorators/require-login';

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
}
