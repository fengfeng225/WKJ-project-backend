import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateDictionaryDto {
  @ApiProperty({
    example:"number",
    description:"id"
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({
    example:"string",
    description:"名称"
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    example:"string",
    description:"编码"
  })
  @IsNotEmpty()
  @IsString()
  entityCode: string;

  @ApiProperty({
    example:"string",
    description:"说明"
  })
  description: string;
}
