import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateUserPasswordDto{
    @ApiProperty({
        example:"123456",
        description:"旧密码"
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(16)
    oldPassword:string;

    @ApiProperty({
        example:"123456",
        description:"新密码"
    })
    @IsString()
    @MinLength(6)
    @MaxLength(16)
    password:string;
}
