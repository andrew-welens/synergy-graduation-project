import bcrypt from 'bcryptjs'
import { type Role, type User } from '../types/models'
import { CreateUserDto } from '../../controllers/users/dto/create-user.dto'
import { UpdateUserDto } from '../../controllers/users/dto/update-user.dto'
import { PrismaService } from '../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'
import { ApiError } from '../common/errors/api-error'

export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly auditService: AuditService) {}

  async list(): Promise<User[]> {
    const rows = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
    return rows as unknown as User[]
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'Not Found')
    }
    return user as unknown as User
  }

  async create(actorId: string, dto: CreateUserDto): Promise<User> {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (exists) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Email уже используется')
    }
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName?.trim(),
        lastName: dto.lastName?.trim(),
        passwordHash: bcrypt.hashSync(dto.password, 10),
        role: dto.role as Role,
        isActive: true
      }
    })
    await this.auditService.record(actorId, 'user.created', 'user', user.id)
    return user as unknown as User
  }

  async update(actorId: string, id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id)
    if ((user.role as Role) === 'admin' && dto.role !== undefined && dto.role !== 'admin') {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Нельзя изменить роль учётной записи администратора')
    }
    const roleChanged = Boolean(dto.role && dto.role !== user.role)
    if (dto.email && dto.email !== user.email) {
      const exists = await this.prisma.user.findUnique({ where: { email: dto.email } })
      if (exists) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Email уже используется')
      }
    }
    const effectiveRole = (user.role as Role) === 'admin' ? 'admin' : (dto.role ?? user.role)
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email ?? user.email,
        firstName: dto.firstName !== undefined ? dto.firstName?.trim() : user.firstName ?? null,
        lastName: dto.lastName !== undefined ? dto.lastName?.trim() : user.lastName ?? null,
        passwordHash: dto.password ? bcrypt.hashSync(dto.password, 10) : user.passwordHash,
        role: effectiveRole,
        isActive: dto.isActive !== undefined ? dto.isActive : user.isActive ?? true
      }
    })
    await this.auditService.record(actorId, 'user.updated', 'user', id)
    if (roleChanged) {
      await this.auditService.record(actorId, 'user.role.changed', 'user', id, { from: user.role, to: dto.role })
    }
    return updated as unknown as User
  }

  async remove(actorId: string, id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'Not Found')
    }
    if ((user.role as Role) === 'admin') {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Нельзя удалить учётную запись администратора')
    }
    await this.prisma.user.delete({ where: { id } })
    await this.auditService.record(actorId, 'user.deleted', 'user', id)
    return { message: 'Удалено' }
  }
}
