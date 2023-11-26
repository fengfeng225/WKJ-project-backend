import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { ButtonModule } from '../button/button.module';
import { ColumnModule } from '../column/column.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu]),
    ButtonModule,
    ColumnModule
  ],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [TypeOrmModule, ButtonModule, ColumnModule]
})
export class MenuModule {}
