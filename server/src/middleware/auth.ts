import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../services/common/errors/api-error'
import { rolePermissions, type Role } from '../services/types/models'
import type { PrismaService } from '../services/prisma/prisma.service'
import { verifyAccessToken } from '../services/utils/jwt'

export const requireAuth = (prisma: PrismaService) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization
      const cookieToken = req.cookies?.accessToken as string | undefined
      const token = cookieToken ?? (header?.startsWith('Bearer ') ? header.slice(7) : undefined)
      if (!token) {
        throw new ApiError(401, 'AUTH_REQUIRED', 'Требуется авторизация')
      }
      const payload = verifyAccessToken(token)
      const user = await prisma.user.findUnique({ where: { id: payload.userId } })
      if (!user) {
        throw new ApiError(403, 'AUTH_INVALID', 'Недействительный токен')
      }
      const role = user.role as Role
      const permissions = rolePermissions[role] ?? []
      req.user = { id: user.id, email: user.email, role, permissions }
      next()
    } catch {
      next(new ApiError(403, 'AUTH_INVALID', 'Недействительный токен'))
    }
  }
}
