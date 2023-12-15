import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateHeatExchangerDto {
  @ApiProperty({
    example:"string",
    description:"id"
  })
  @IsNotEmpty()
  @IsString()
  id: string;
  
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
    description:"设备名称"
  })
  @IsNotEmpty()
  @IsString()
  equipmentName: string;

  @ApiProperty({
    example:"string",
    description:"设备位号"
  })
  @IsNotEmpty()
  @IsString()
  equipmentTag: string;

  @ApiProperty({
    example:"string",
    description:"设计(操作)压力  管/壳"
  })
  @IsNotEmpty()
  @IsString()
  pressure: string;

  @ApiProperty({
    example:"string",
    description:"设计(操作)温度 管/壳"
  })
  @IsNotEmpty()
  @IsString()
  temperature: string;

  @ApiProperty({
    example:"string",
    description:"介质 壳/管"
  })
  @IsNotEmpty()
  @IsString()
  media: string;

  @ApiProperty({
    example:"string",
    description:"规格型号"
  })
  @IsNotEmpty()
  @IsString()
  size: string;

  @ApiProperty({
    example:"string",
    description:"内漏后风险评价"
  })
  @IsNotEmpty()
  @IsString()
  endoleakageRiskAssessment: string;

  @ApiProperty({
    example:"string",
    description:"内漏判断"
  })
  @IsNotEmpty()
  @IsString()
  endoleakageJudge: string;

  @ApiProperty({
    example:"string",
    description:"内漏后处理"
  })
  @IsNotEmpty()
  @IsString()
  endoleakageDispose: string;
}
