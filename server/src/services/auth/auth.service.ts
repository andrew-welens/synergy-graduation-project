import bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { type User } from '../types/models'
import { AuditService } from '../audit/audit.service'
import { ApiError } from '../common/errors/api-error'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'

export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly auditService: AuditService) {}

  async login(email: string, password: string) {
    const user = await this.findUserByEmail(email)
    if (!user) {
      throw new ApiError(401, 'AUTH_INVALID', 'Неверный логин или пароль')
    }
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      throw new ApiError(401, 'AUTH_INVALID', 'Неверный логин или пароль')
    }
    const tokens = this.issueTokens(user)
    await this.auditService.record(user.id, 'auth.login', 'auth', user.id, { email })
    return tokens
  }

  async refresh(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken)
      const user = await this.findUserById(payload.userId)
      if (!user) {
        throw new ApiError(403, 'AUTH_INVALID', 'Недействительный токен')
      }
      const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role })
      return { accessToken }
    } catch {
      throw new ApiError(403, 'AUTH_INVALID', 'Недействительный токен')
    }
  }

  private issueTokens(user: User) {
    const payload = { userId: user.id, email: user.email, role: user.role }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)
    return { accessToken, refreshToken }
  }

  private async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } }) as unknown as User | null
  }

  private async findUserById(id: string) {
    return await this.prisma.user.findUnique({ where: { id } }) as unknown as User | null
  }
}
