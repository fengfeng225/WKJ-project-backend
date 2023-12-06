import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from 'class-validator';

export class FindLogDto {
  @ApiProperty({
    description:"下发结果"
  })
  @IsOptional()
  runResult: number;

  @ApiProperty({
    description:"页码"
  })
  @IsOptional()
  currentPage: number;

  @ApiProperty({
    description:"每页数量"
  })
  @IsOptional()
  pageSize: number;

  @ApiProperty({
    description:"起始时间"
  })
  @IsOptional()
  startTime: Date;

  @ApiProperty({
    description:"截止时间"
  })
  @IsOptional()
  endTime: Date;
}
