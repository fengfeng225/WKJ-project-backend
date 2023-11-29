import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example:"number",
    description:"所属班组Id"
  })
  @IsNotEmpty()
  @IsNumber()
  classId: number;
}
