import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/core/auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../../feature/user/user.module'

const jwtModule = JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
})

@Module({
  imports: [
    PassportModule,
    jwtModule,
    UserModule
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [jwtModule]
})
export class AuthModule {}
