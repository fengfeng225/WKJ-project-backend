import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from 'class-validator';

export class FindLogListDto {
  @ApiProperty({
    description:"关键词"
  })
  @IsOptional()
  keyword: string;

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
}
