import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import bcrypt from 'bcryptjs'
import { PrismaService } from '../../prisma/prisma.service'
import { type User } from '../../types/models'
import { AuditService } from '../audit/audit.service'

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService, private readonly auditService: AuditService) {}

  async login(email: string, password: string) {
    const user = await this.findUserByEmail(email)
    if (!user) {
      throw new UnauthorizedException({ code: 'AUTH_INVALID', message: 'Неверный логин или пароль' })
    }
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      throw new UnauthorizedException({ code: 'AUTH_INVALID', message: 'Неверный логин или пароль' })
    }
    const tokens = this.issueTokens(user)
    await this.auditService.record(user.id, 'auth.login', 'auth', user.id, { email })
    return tokens
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: this.refreshSecret() }) as { userId: string, email: string, role: string }
      const user = await this.findUserById(payload.userId)
      if (!user) {
        throw new ForbiddenException({ code: 'AUTH_INVALID', message: 'Недействительный токен' })
      }
      const accessToken = this.jwtService.sign({ userId: user.id, email: user.email, role: user.role }, { expiresIn: '30m' })
      return { accessToken }
    } catch {
      throw new ForbiddenException({ code: 'AUTH_INVALID', message: 'Недействительный токен' })
    }
  }

  private issueTokens(user: User) {
    const payload = { userId: user.id, email: user.email, role: user.role }
    const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' })
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d', secret: this.refreshSecret() })
    return { accessToken, refreshToken }
  }

  private refreshSecret() {
    return process.env.JWT_REFRESH_SECRET ?? 'dev-refresh'
  }

  private async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } }) as unknown as User | null
  }

  private async findUserById(id: string) {
    return await this.prisma.user.findUnique({ where: { id } }) as unknown as User | null
  }
}
