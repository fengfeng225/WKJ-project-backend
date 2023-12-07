import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateCheckPlanDto {
  @ApiProperty({
    example:"string",
    description:"id"
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    example:"string",
    description:"名称"
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    example:"string",
    description:"cron表达式"
  })
  @IsNotEmpty()
  @IsString()
  cron: string;

  @ApiProperty({
    example:"number",
    description:"排序"
  })
  @IsNumber()
  sortCode: number;

  @ApiProperty({
    example:"string",
    description:"说明"
  })
  description: string;
}
