import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictionaryService } from './dictionary.service';
import { DictionaryController } from './dictionary.controller';
import { Dictionary } from './entities/dictionary.entity';
import { SelectOption } from './entities/option.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dictionary, SelectOption])
  ],
  controllers: [DictionaryController],
  providers: [DictionaryService],
})
export class DictionaryModule {}
