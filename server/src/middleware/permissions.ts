import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../services/common/errors/api-error'
import { rolePermissions, type Permission, type Role } from '../services/types/models'

export const requirePermissions = (...permissions: Permission[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (permissions.length === 0) {
      return next()
    }
    const role = req.user?.role as Role | undefined
    if (!role) {
      return next(new ApiError(403, 'FORBIDDEN', 'Доступ запрещен'))
    }
    const allowed = rolePermissions[role] ?? []
    const hasAccess = permissions.some((permission) => allowed.includes(permission))
    if (!hasAccess) {
      return next(new ApiError(403, 'FORBIDDEN', 'Доступ запрещен'))
    }
    next()
  }
}
