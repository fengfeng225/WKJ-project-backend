import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOptionDto {
  @ApiProperty({
    example:"string",
    description:"所属字段Id"
  })
  @IsNotEmpty()
  @IsString()
  dictionaryId: string;

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
