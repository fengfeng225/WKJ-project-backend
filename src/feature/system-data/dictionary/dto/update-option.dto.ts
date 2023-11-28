import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateOptionDto {
  @ApiProperty({
    example:"number",
    description:"Id"
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;
  
  @ApiProperty({
    example:"number",
    description:"所属字段Id"
  })
  @IsNotEmpty()
  @IsNumber()
  dictionaryId: number;

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
