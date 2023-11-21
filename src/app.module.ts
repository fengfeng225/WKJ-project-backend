import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './feature/user/user.module';
import { PostModule } from './feature/post/post.module';
import { AuthModule } from './core/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './core/auth/jwt.auth.guard';
import { ConfigModule, ConfigService  } from '@nestjs/config';
import envConfig from 'config/envConfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [envConfig.path],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST') ?? 'localhost',
        port: configService.get<number>('DB_PORT') ?? 3306,
        username: configService.get<string>('DB_USERNAME') ?? 'root',
        password: configService.get<string>('DB_PASSWORD') ?? 'admin123',
        database: configService.get<string>('DB_DATABASE') ?? 'my_db_01',
        synchronize: true,
        autoLoadEntities: true,
      })
    }),
    UserModule,
    PostModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide:APP_GUARD,
      useClass:JwtAuthGuard
    }
  ],
})
export class AppModule {}
