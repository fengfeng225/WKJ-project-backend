import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from 'class-validator';

export class FixRecordDto {
  @ApiProperty({
    example:"string",
    description:"id"
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    example:"string",
    description:"说明"
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}
