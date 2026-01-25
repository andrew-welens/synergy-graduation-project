import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { rolePermissions, type Role } from '../../types/models'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const header = request.headers.authorization as string | undefined
    const cookieToken = request.cookies?.accessToken as string | undefined
    const token = cookieToken ?? (header?.startsWith('Bearer ') ? header.slice(7) : undefined)
    if (!token) {
      throw new UnauthorizedException({ code: 'AUTH_REQUIRED', message: 'Требуется авторизация' })
    }
    try {
      const payload = this.jwtService.verify(token) as { userId: string, email: string, role: Role }
      const user = await this.prisma.user.findUnique({ where: { id: payload.userId } })
      if (!user) {
        throw new ForbiddenException({ code: 'AUTH_INVALID', message: 'Недействительный токен' })
      }
      const role = user.role as Role
      const permissions = rolePermissions[role] ?? []
      request.user = { id: user.id, email: user.email, role, permissions }
      return true
    } catch {
      throw new ForbiddenException({ code: 'AUTH_INVALID', message: 'Недействительный токен' })
    }
  }
}
