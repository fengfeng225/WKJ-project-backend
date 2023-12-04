import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { MbModule } from '../bill/mb/mb.module';

@Module({
  imports: [MbModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
