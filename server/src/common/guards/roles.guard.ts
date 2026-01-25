import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator'
import { rolePermissions, type Permission, type Role } from '../../types/models'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ])
    if (!permissions || permissions.length === 0) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const user = request.user as { role?: Role } | undefined
    if (!user?.role) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Доступ запрещен' })
    }
    const allowed = rolePermissions[user.role] ?? []
    const hasAccess = permissions.some((permission) => allowed.includes(permission))
    if (!hasAccess) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Доступ запрещен' })
    }
    return true
  }
}
