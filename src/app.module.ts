import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './feature/user/user.module';
import { AuthModule } from './core/auth/auth.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpReqTransformInterceptor } from './core/interceptors/http-req.interceptor';
import { AllExceptionFilter } from './core/filters/all-exception.filter';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './core/auth/jwt.auth.guard';
import { PermissionGuard } from './feature/user/permission.guard';
import { RoleModule } from './feature/role/role.module';
import { MenuModule } from './feature/menu/menu.module';
import { ButtonModule } from './feature/button/button.module';
import { ColumnModule } from './feature/column/column.module';
import { MbModule } from './feature/bill/mb/mb.module';
import { DictionaryModule } from './feature/system-data/dictionary/dictionary.module';
import { HomeModule } from './feature/home/home.module';
import { CheckPlanModule } from './feature/check-plan/check-plan.module';
import { ClassModule } from './feature/bill/class/class.module';
import envConfig from 'config/envConfig';
import { CustomLogger } from 'src/core/logger/custom-logger-service';
import { LogModule } from './log/log.module';
import { UndergroundSludgeOilModule } from './feature/bill/mutual-channeling-point/underground-sludge-oil/underground-sludge-oil.module';
import { HeatExchangerModule } from './feature/bill/mutual-channeling-point/heat-exchanger/heat-exchanger.module';
import { ContainerModule } from './feature/bill/mutual-channeling-point/container/container.module';
import { KeyPointModule } from './feature/bill/mutual-channeling-point/key-point/key-point.module';
import { OtherPointModule } from './feature/bill/mutual-channeling-point/other-point/other-point.module';
import { PipeCapModule } from './feature/bill/pipe-cap/pipe-cap.module';

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
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    MenuModule,
    RoleModule,
    ButtonModule,
    ColumnModule,
    MbModule,
    DictionaryModule,
    HomeModule,
    CheckPlanModule,
    ClassModule,
    LogModule,
    UndergroundSludgeOilModule,
    HeatExchangerModule,
    ContainerModule,
    KeyPointModule,
    OtherPointModule,
    PipeCapModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CustomLogger,
    {
      provide:APP_GUARD,
      useClass:JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpReqTransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter
    }
  ],
  exports: [CustomLogger]
})
export class AppModule {}
