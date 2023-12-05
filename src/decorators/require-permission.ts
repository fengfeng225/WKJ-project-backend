import { SetMetadata } from '@nestjs/common';

interface PermissionsObject {
  // 定义对象的属性
  requireMenu: string;
  requireButton: string | null;
}

export const Require_Permission_Key = 'require-permission';
export const RequirePermission = (permissions: string | PermissionsObject) => SetMetadata(Require_Permission_Key, permissions);