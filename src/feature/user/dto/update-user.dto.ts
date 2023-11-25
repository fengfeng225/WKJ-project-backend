import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto{
    @ApiProperty({
        example:"123456",
        description:"新密码"
    })
    @IsNotEmpty({message: '新密码不能为空'})
    @IsString()
    @MinLength(6)
    @MaxLength(16)
    password:string;

    @ApiProperty({
        example:"123456",
        description:"确认新密码"
    })
    @IsString()
    @MinLength(6)
    @MaxLength(16)
    password2:string;
}