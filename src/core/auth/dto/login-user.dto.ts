import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from 'class-validator';

export class LoginUserDTO{
    @ApiProperty({
        example:"admin",
        description:"账户名"
    })
    @IsNotEmpty({message: '用户名不能为空'})
    account:string;

    @ApiProperty({
        example:"123456",
        description:"用户密码"
    })
    @IsNotEmpty({message: '密码不能为空'})
    password:string;
}