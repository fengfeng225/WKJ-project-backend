import { Controller, Post, Body, Get, Request, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from './auth.service'
import { ApiBody, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LoginUserDTO } from 'src/core/auth/dto/login-user.dto';
import { RequireLogin } from 'src/decorators/require-login';

@ApiTags('auth')
@ApiBearerAuth()
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 登录
  @ApiOperation({summary:"用户登录"})
  @RequireLogin()
  @Post('auth/login')
  @ApiBody({
    type:LoginUserDTO
  })
  login(@Body() loginUserDTO: LoginUserDTO){
    return this.authService.login(loginUserDTO);
  }

  // 查询个人信息
  @ApiOperation({summary:"获取用户信息"})
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('api/auth/info')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId, req.user.account);
  }

  // 登出
  @ApiOperation({summary:"登出"})
  @Post('api/auth/logout')
  logout(@Request() req) {
    return this.authService.logout(req.user.userId);
  }

}
