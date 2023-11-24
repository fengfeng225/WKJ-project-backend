import { SetMetadata } from '@nestjs/common';

export const Require_Login_Key = 'requireLogin';
export const RequireLogin = () => SetMetadata(Require_Login_Key, true);