import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example:"string",
    description:"id"
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    example:"string",
    description:"账户名"
  })
  @IsNotEmpty()
  @IsString()
  account: string;

  @ApiProperty({
    example:"string",
    description:"用户名称"
  })
  @IsNotEmpty()
  @IsString()
  userName: string;

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

  @ApiProperty({
    example:"[]",
    description:"绑定角色id"
  })
  @IsArray()
  roleId: Array<string>;
}
