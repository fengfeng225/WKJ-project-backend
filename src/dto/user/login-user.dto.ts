import { ApiProperty } from "@nestjs/swagger";

export class LoginUserDTO{
    @ApiProperty({
        example:"admin",
        description:"账户名"
    })
    account:string;

    @ApiProperty({
        example:"admin",
        description:"用户密码"
    })
    password:string;
}