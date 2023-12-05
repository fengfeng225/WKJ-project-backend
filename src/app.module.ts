import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './feature/user/user.module';
import { AuthModule } from './core/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './core/auth/jwt.auth.guard';
import { PermissionGuard } from './feature/user/permission.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoleModule } from './feature/role/role.module';
import { MenuModule } from './feature/menu/menu.module';
import { ButtonModule } from './feature/button/button.module';
import { ColumnModule } from './feature/column/column.module';
import { MbModule } from './feature/bill/mb/mb.module';
import { DictionaryModule } from './feature/system-data/dictionary/dictionary.module';
import { HomeModule } from './feature/home/home.module';
import { CheckPlanModule } from './feature/check-plan/check-plan.module';
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
        host: configService.get<string>('DB_HOST'),
        port: JSON.parse(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        synchronize: JSON.parse(configService.get<string>('DB_SYNCHRONIZE')),
        autoLoadEntities: true,
        dateStrings: true,
      })
    }),
    UserModule,
    AuthModule,
    MenuModule,
    RoleModule,
    ButtonModule,
    ColumnModule,
    MbModule,
    DictionaryModule,
    HomeModule,
    CheckPlanModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide:APP_GUARD,
      useClass:JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    }
  ],
})
export class AppModule {}
