import bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { type User, type Role, rolePermissions, type Permission } from '../types/models'
import { AuditService } from '../audit/audit.service'
import { ApiError } from '../common/errors/api-error'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    role: Role
    permissions: Permission[]
  }
}

export interface RefreshResponse {
  accessToken: string
  user: {
    id: string
    email: string
    role: Role
    permissions: Permission[]
  }
}

export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly auditService: AuditService) {}

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.findUserByEmail(email)
    if (!user) {
      throw new ApiError(401, 'AUTH_INVALID', 'Неверный логин или пароль')
    }
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      throw new ApiError(401, 'AUTH_INVALID', 'Неверный логин или пароль')
    }
    const tokens = this.issueTokens(user)
    const permissions = rolePermissions[user.role] ?? []
    await this.auditService.record(user.id, 'auth.login', 'auth', user.id, { email })
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions
      }
    }
  }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    try {
      const payload = verifyRefreshToken(refreshToken)
      const user = await this.findUserById(payload.userId)
      if (!user) {
        throw new ApiError(403, 'AUTH_INVALID', 'Недействительный токен')
      }
      const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role })
      const permissions = rolePermissions[user.role] ?? []
      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions
        }
      }
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
