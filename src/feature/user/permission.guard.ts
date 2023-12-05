import { CanActivate, ExecutionContext, Injectable, Inject, UnauthorizedException } from '@nestjs/common';
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
    // 必须写前面，否则登录接口获取不到user信息
    const permissions = this.reflector.getAllAndOverride(Require_Permission_Key, [
      context.getClass(),
      context.getHandler()
    ])
    if (!permissions) return true

    const request = context.switchToHttp().getRequest()
    if (request.user.account === 'admin') return true

    if (typeof permissions === 'string' && permissions === 'admin') throw new UnauthorizedException('您没有权限访问！');

    const {requireMenu, requireButton} = permissions
    const menuWithButtons = await this.userService.getUserPermissions(request.user.userId)
    
    let canAccessApi = true
    const menu = menuWithButtons.find(menu => requireMenu === menu.entityCode)
    if (!menu) {
      canAccessApi = false
    } else {
      if (!requireButton) return canAccessApi;
      canAccessApi = menu.buttons.some(button => button.entityCode === requireButton)
    }

    if (!canAccessApi) throw new UnauthorizedException('您没有权限访问！');
    return true;
  }
}
