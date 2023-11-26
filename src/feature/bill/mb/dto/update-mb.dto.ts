import { PartialType } from '@nestjs/swagger';
import { CreateMbDto } from './create-mb.dto';

export class UpdateMbDto extends PartialType(CreateMbDto) {}
