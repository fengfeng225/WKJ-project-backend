import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetUserPasswordDto{
    @ApiProperty({
        example:"123456",
        description:"新密码"
    })
    @IsNotEmpty()
    @IsString()
    userPassword:string;

    @ApiProperty({
        example:"123456",
        description:"确认新密码"
    })
    @IsNotEmpty()
    @IsString()
    validatePassword:string;
}
