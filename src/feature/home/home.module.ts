import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { MbModule } from '../bill/mb/mb.module';
import { MenuModule } from '../menu/menu.module';

@Module({
  imports: [MbModule, MenuModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
