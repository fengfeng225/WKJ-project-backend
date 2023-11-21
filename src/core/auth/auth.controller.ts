import { Controller, UseGuards, Post, Get, Request, Param, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service'
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginUserDTO } from 'src/dto/user/login-user.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 登录接口
  @ApiOperation({summary:"用户登录"})
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiBody({
    type:LoginUserDTO,
    description:"请求体参数"
  })
  login(@Request() req){
    return this.authService.login(req.user);
  }

  // 查询个人信息
  @Get('profile/:id')
  getProfile(@Param('id') id: number) {
    return this.authService.getProfile(id);
  }
}
