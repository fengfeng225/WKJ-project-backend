import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { MbModule } from '../bill/mb/mb.module';
import { CheckRecord } from '../check-plan/entities/check-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckRecord]),
    MbModule
  ],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
