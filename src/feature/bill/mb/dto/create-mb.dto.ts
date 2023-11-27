import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateMbDto {
  @ApiProperty({
    example:"number",
    description:"所属班组Id"
  })
  @IsNotEmpty()
  @IsNumber()
  classId: number;

  @ApiProperty({
    example:"string",
    description:"装置名称"
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example:"string",
    description:"编号"
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    example:"string",
    description:"状态"
  })
  @IsNotEmpty()
  @IsNumber()
  status: number;

  @ApiProperty({
    example:"string",
    description:"管径"
  })
  @IsNotEmpty()
  @IsString()
  pipDiameter: string;

  @ApiProperty({
    example:"string",
    description:"盲板安装位置描述"
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example:"number",
    description:"管线介质名称"
  })
  @IsNotEmpty()
  @IsString()
  pipelineMediaName: string;

  @ApiProperty({
    example:"string",
    description:"管线介质温度"
  })
  @IsNotEmpty()
  @IsString()
  pipelineMediaTemperature: string;

  @ApiProperty({
    example:"string",
    description:"管线介质压力"
  })
  @IsNotEmpty()
  @IsString()
  pipelineMediaPressure: string;

  @ApiProperty({
    example:"string",
    description:"盲板规格"
  })
  @IsNotEmpty()
  @IsString()
  size: string;

  @ApiProperty({
    example:"string",
    description:"盲板形式"
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    example:"string",
    description:"盲板材质"
  })
  @IsNotEmpty()
  @IsString()
  material: string;

  @ApiProperty({
    example:"string",
    description:"拆装时间"
  })
  @IsNotEmpty()
  disassembleTime: Date;

  @ApiProperty({
    example:"string",
    description:"操作人员"
  })
  @IsNotEmpty()
  @IsString()
  operator: string;

  @ApiProperty({
    example:"string",
    description:"管理干部"
  })
  @IsNotEmpty()
  @IsString()
  manager: string;
}
