import { SetMetadata } from '@nestjs/common';

export const Require_Permission_Key = 'require-permission';
export const RequirePermission = (permissions = {requireMenus: [], requireButtons: []}) => SetMetadata(Require_Permission_Key, permissions);