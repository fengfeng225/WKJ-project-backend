import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({
    example:"number",
    description:"父级Id"
  })
  @IsNotEmpty()
  @IsNumber()
  parentId: number;

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
    description:"图标"
  })
  @IsNotEmpty()
  @IsString()
  icon: string;

  @ApiProperty({
    example:"number",
    description:"类型"
  })
  @IsNotEmpty()
  @IsNumber()
  type: number;

  @ApiProperty({
    example:"string",
    description:"地址"
  })
  @IsOptional()
  urlAddress: string;

  @ApiProperty({
    example:"string",
    description:"说明"
  })
  @IsOptional()
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
