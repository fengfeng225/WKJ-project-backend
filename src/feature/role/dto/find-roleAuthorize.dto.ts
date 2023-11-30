import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from 'class-validator';

export class FindRoleAuthorizeDto {
  @ApiProperty({
    example:"string",
    description:"要获取的权限类型"
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    example:"string",
    description:"菜单id"
  })
  @IsString()
  menuIds: string;
}
