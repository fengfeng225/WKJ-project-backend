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
import { CustomLogger } from 'src/core/logger/custom-logger-service';
import { LogModule } from './log/log.module';
import { UndergroundSludgeOilModule } from './feature/bill/mutual-channeling-point/underground-sludge-oil/underground-sludge-oil.module';
import { HeatExchangerModule } from './feature/bill/mutual-channeling-point/heat-exchanger/heat-exchanger.module';
import { ContainerModule } from './feature/bill/mutual-channeling-point/container/container.module';
import { KeyPointModule } from './feature/bill/mutual-channeling-point/key-point/key-point.module';
import { OtherPointModule } from './feature/bill/mutual-channeling-point/other-point/other-point.module';
import { PipeCapModule } from './feature/bill/pipe-cap/pipe-cap.module';
import * as dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'development' ? '.env.local' : '.env.prod'
});

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: JSON.parse(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: JSON.parse(process.env.DB_SYNCHRONIZE),
      autoLoadEntities: true,
      dateStrings: true,
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
