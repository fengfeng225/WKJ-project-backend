import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckInfoDto {
  @ApiProperty({
    example:"string",
    description:"班组id"
  })
  @IsNotEmpty()
  @IsString()
  classIds: string;

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
