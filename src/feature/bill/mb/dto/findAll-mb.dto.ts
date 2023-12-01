import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from 'class-validator';

export class FindAllMbDto {
  @ApiProperty({
    description:"班组Id"
  })
  @IsOptional()
  classId: string;

  @ApiProperty({
    description:"关键词(编号)"
  })
  @IsOptional()
  keyword: string;

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
    description:"查询条件"
  })
  @IsOptional()
  queryJson: string;
}
