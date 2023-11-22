import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menulist } from './entities/menu.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menulist])
  ],
  controllers: [MenuController],
  providers: [],
  exports: []
})

export class MenuModule {}
