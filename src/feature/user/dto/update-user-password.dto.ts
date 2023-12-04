import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserPasswordDto{
    @ApiProperty({
        example:"123456",
        description:"旧密码"
    })
    @IsNotEmpty()
    @IsString()
    oldPassword:string;

    @ApiProperty({
        example:"123456",
        description:"新密码"
    })
    @IsNotEmpty()
    @IsString()
    password:string;
}
