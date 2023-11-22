import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from 'class-validator';

export class LoginUserDTO{
    @ApiProperty({
        example:"admin",
        description:"账户名"
    })
    @IsNotEmpty()
    account:string;

    @ApiProperty({
        example:"123456",
        description:"用户密码"
    })
    @IsNotEmpty()
    password:string;
}