import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsArray } from 'class-validator';

export class DeleteLogsDto {
  @ApiProperty({
    example: '[]',
    description:"日志id"
  })
  @IsNotEmpty()
  @IsArray()
  ids: Array<number>;
}
