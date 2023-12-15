import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateKeyPointDto {
  @ApiProperty({
    example:"string",
    description:"所属班组Id"
  })
  @IsNotEmpty()
  @IsString()
  classId: string;

  @ApiProperty({
    example:"string",
    description:"装置名称"
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example:"string",
    description:"高压窜低压部位"
  })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({
    example:"string",
    description:"现状描述"
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example:"string",
    description:"存在问题及风险分析"
  })
  @IsNotEmpty()
  @IsString()
  riskAnalysis: string;

  @ApiProperty({
    example:"string",
    description:"现有或临时防窜措施"
  })
  @IsNotEmpty()
  @IsString()
  measures: string;
}
