import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    example:"number",
    description:"id"
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;
  
  @ApiProperty({
    example:"string",
    description:"角色名称"
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    example:"string",
    description:"角色编码"
  })
  @IsNotEmpty()
  @IsString()
  entityCode: string;

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
}
