import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from 'class-validator';

export class UpdateRoleAuthorizeDto {
  @ApiProperty({
    example:"array",
    description:"menus"
  })
  @IsArray()
  menus: Array<string>;

  @ApiProperty({
    example:"array",
    description:"buttons"
  })
  @IsArray()
  buttons: Array<string>;

  @ApiProperty({
    example:"array",
    description:"columns"
  })
  @IsArray()
  columns: Array<string>;
}
