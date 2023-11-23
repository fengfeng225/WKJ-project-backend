import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { Button_permission } from 'src/entities/button_permission.entity';
import { Column_permission } from 'src/entities/column_permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, Button_permission, Column_permission])
  ],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
