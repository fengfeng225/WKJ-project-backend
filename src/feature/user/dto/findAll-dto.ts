import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from 'class-validator';

export class FindAllDto{
    @ApiProperty({
        example:"string",
        description:"关键词"
    })
    @IsOptional()
    keyword:string;

    @ApiProperty({
      example:"number",
      description:"页码"
    })
    @IsOptional()
    currentPage:number;

    @ApiProperty({
      example:"number",
      description:"每页条数"
    })
    @IsOptional()
    pageSize:number;
}