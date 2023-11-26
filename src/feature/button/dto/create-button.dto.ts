import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateButtonDto {
  @ApiProperty({
    example:"number",
    description:"所属菜单Id"
  })
  @IsNotEmpty()
  @IsNumber()
  menuId: number;

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

  @ApiProperty({
    example:"number",
    description:"排序"
  })
  @IsNumber()
  sortCode: number;

  @ApiProperty({
    example:"number",
    description:"启用状态"
  })
  @IsNumber()
  enabledMark: number;
}
