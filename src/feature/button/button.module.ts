import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ButtonService } from './button.service';
import { ButtonController } from './button.controller';
import { Button_permission } from './entities/button_permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Button_permission])
  ],
  controllers: [ButtonController],
  providers: [ButtonService],
  exports: [TypeOrmModule]
})
export class ButtonModule {}
