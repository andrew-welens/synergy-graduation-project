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
        name: dto.name?.trim(),
        passwordHash: bcrypt.hashSync(dto.password, 10),
        role: dto.role as Role
      }
    })
    await this.auditService.record(actorId, 'user.created', 'user', user.id)
    return user as unknown as User
  }

  async update(actorId: string, id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id)
    const roleChanged = Boolean(dto.role && dto.role !== user.role)
    if (dto.email && dto.email !== user.email) {
      const exists = await this.prisma.user.findUnique({ where: { email: dto.email } })
      if (exists) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Email уже используется')
      }
    }
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email ?? user.email,
        name: dto.name?.trim() ?? user.name,
        passwordHash: dto.password ? bcrypt.hashSync(dto.password, 10) : user.passwordHash,
        role: dto.role ?? user.role
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
    await this.prisma.user.delete({ where: { id } })
    await this.auditService.record(actorId, 'user.deleted', 'user', id)
    return { message: 'Удалено' }
  }
}
