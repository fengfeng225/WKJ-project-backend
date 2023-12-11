import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({
    example:"string",
    description:"parentId"
  })
  @IsNotEmpty()
  @IsString()
  parentId: string;

  @ApiProperty({
    example:"string",
    description:"班组名称"
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    example:"number",
    description:"排序"
  })
  @IsNumber()
  sortCode: number;
}