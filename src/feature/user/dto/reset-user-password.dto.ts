import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class ResetUserPasswordDto{
    @ApiProperty({
        example:"123456",
        description:"新密码"
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(16)
    userPassword:string;

    @ApiProperty({
        example:"123456",
        description:"确认新密码"
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(16)
    validatePassword:string;
}
