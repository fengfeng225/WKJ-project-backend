import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePipeCapDto {
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
    description:"放空阀封堵位置"
  })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({
    example:"string",
    description:"介质"
  })
  @IsNotEmpty()
  @IsString()
  media: string;

  @ApiProperty({
    example:"string",
    description:"介质最高操作温度 (℃)"
  })
  @IsNotEmpty()
  @IsString()
  temperature: string;

  @ApiProperty({
    example:"string",
    description:"介质最高操作压力 (MPa)"
  })
  @IsNotEmpty()
  @IsString()
  pressure: string;

  @ApiProperty({
    example:"string",
    description:"放空阀封堵直径 (DN)"
  })
  @IsNotEmpty()
  @IsString()
  diameter: string;

  @ApiProperty({
    example:"string",
    description:"放空阀封堵类型"
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    example:"string",
    description:"封堵形式"
  })
  @IsNotEmpty()
  @IsString()
  plugging: string;
}
