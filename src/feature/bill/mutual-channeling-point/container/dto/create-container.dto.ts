import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateContainerDto {
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
    description:"互窜点位置"
  })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({
    example:"string",
    description:"设置液位高低报警"
  })
  @IsNotEmpty()
  @IsNumber()
  liquidLevelAlarm: number;

  @ApiProperty({
    example:"string",
    description:"纳入平稳率管理"
  })
  @IsNotEmpty()
  @IsNumber()
  smoothnessRate: number;

  @ApiProperty({
    example:"string",
    description:"互窜后风险"
  })
  @IsNotEmpty()
  @IsString()
  risk: string;

  @ApiProperty({
    example:"string",
    description:"风险管控措施"
  })
  @IsNotEmpty()
  @IsString()
  riskControlMeasure: string;

  @ApiProperty({
    example:"string",
    description:"评价结果"
  })
  @IsNotEmpty()
  @IsString()
  evaluation: string;
}
