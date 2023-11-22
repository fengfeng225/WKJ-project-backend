import { Controller, UseGuards, Post, Body, Get, Request, Param } from '@nestjs/common';
import { AuthService } from './auth.service'
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LoginUserDTO } from 'src/core/auth/dto/login-user.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 登录接口
  @ApiOperation({summary:"用户登录"})
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiBody({
    type:LoginUserDTO
  })
  login(@Body() LoginUserDTO: LoginUserDTO, @Request() req){
    console.log(123);
    
    return this.authService.login(req.user);
  }

  // 查询个人信息
  @ApiOperation({summary:"获取用户信息"})
  @Get('profile/:id')
  getProfile(@Param('id') id: number) {
    return this.authService.getProfile(id);
  }

}
