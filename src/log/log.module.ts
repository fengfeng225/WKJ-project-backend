import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogService } from './log.service';
import { Log } from './entities/log.entity';
import { User } from '../feature/user/entities/user.entity';
import { LogController } from './log.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Log, User])
  ],
  providers: [LogService],
  exports: [LogService],
  controllers: [LogController]
})
export class LogModule {}
