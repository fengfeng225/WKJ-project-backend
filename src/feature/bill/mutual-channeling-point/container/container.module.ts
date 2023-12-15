import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContainerService } from './container.service';
import { ContainerController } from './container.controller';
import { Container } from './entities/container.entity';
import { BillClass } from '../../class/entities/class.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Container, BillClass])
  ],
  controllers: [ContainerController],
  providers: [ContainerService],
})
export class ContainerModule {}
