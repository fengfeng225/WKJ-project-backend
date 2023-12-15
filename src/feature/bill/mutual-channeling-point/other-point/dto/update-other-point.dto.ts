import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateOtherPointDto {
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
    description:"互窜点位置"
  })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({
    example:"string",
    description:"前/后介质"
  })
  @IsNotEmpty()
  @IsString()
  media: string;

  @ApiProperty({
    example:"string",
    description:"前/后压力 (MPa)"
  })
  @IsNotEmpty()
  @IsString()
  pressure: string;

  @ApiProperty({
    example:"string",
    description:"隔离方式"
  })
  @IsNotEmpty()
  @IsString()
  isolationWay: string;

  @ApiProperty({
    example:"string",
    description:"互窜后风险"
  })
  @IsNotEmpty()
  @IsString()
  risk: string;

  @ApiProperty({
    example:"string",
    description:"防互窜控制措施"
  })
  @IsNotEmpty()
  @IsString()
  controlMeasure: string;
}
