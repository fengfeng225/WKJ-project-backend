import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from 'class-validator';

export class UpdateClassAuthorizeDto {
  @ApiProperty({
    example:"array",
    description:"classIds"
  })
  @IsArray()
  classIds: Array<string>;
}
