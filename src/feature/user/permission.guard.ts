import { CanActivate, ExecutionContext, Injectable, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Require_Permission_Key } from '../../decorators/require-permission';
import { UserService } from './user.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    @Inject(UserService)
    private userService: UserService,
    private reflector: Reflector
  ) {}

  async canActivate( context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.getAllAndOverride<{requireMenus: string[], requireButtons: []}>(Require_Permission_Key, [
      context.getClass(),
      context.getHandler()
    ])

    if (!permissions) return true
    
    const request = context.switchToHttp().getRequest()

    if (request.user.account === 'admin') return true

    const {requireMenus, requireButtons} = permissions
    const {menus, buttons} = await this.userService.getUserPermissions(request.user.userId)
    // console.log(menus, buttons);
    const canAccessMenu = menus.some(menu => requireMenus.includes(menu.entityCode))
    const canAccessButton = false

    const hasPermission = canAccessMenu || canAccessButton
    
    return hasPermission;
  }
}
