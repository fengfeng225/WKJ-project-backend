import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class CheckInfoDto {
  @ApiProperty({
    example:"[]",
    description:"班组id"
  })
  @IsNotEmpty()
  @IsArray()
  classIds: Array<string>;

  @ApiProperty({
    example:"string",
    description:"检查人员"
  })
  @IsNotEmpty()
  @IsString()
  inspector: string;

  @ApiProperty({
    example:"string",
    description:"台账类别"
  })
  @IsNotEmpty()
  @IsString()
  type: string;
}
