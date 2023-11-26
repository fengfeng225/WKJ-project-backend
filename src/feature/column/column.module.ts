import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { Column_permission } from './entities/column_permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Column_permission])
  ],
  controllers: [ColumnController],
  providers: [ColumnService],
  exports: [TypeOrmModule]
})
export class ColumnModule {}
