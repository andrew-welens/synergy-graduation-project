import { type Client } from '../types/models'
import { CreateClientDto } from '../../controllers/clients/dto/create-client.dto'
import { UpdateClientDto } from '../../controllers/clients/dto/update-client.dto'
import { PrismaService } from '../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'
import { ApiError } from '../common/errors/api-error'
import { Prisma } from '@prisma/client'

const buildContainsFilter = (value: string) => ({ contains: value, mode: Prisma.QueryMode.insensitive })
const normalizePhone = (value?: string) => {
  const normalized = value?.replace(/[^\d+]/g, '').trim()
  return normalized && normalized.length > 0 ? normalized : undefined
}

export class ClientsService {
  constructor(private readonly prisma: PrismaService, private readonly auditService: AuditService) {}

  async findAll(
    page: number,
    pageSize: number,
    hasOrders?: boolean,
    search?: string,
    type?: 'legal' | 'individual',
    sortBy?: 'name' | 'email' | 'ordersCount' | 'createdAt',
    sortDir?: 'asc' | 'desc'
  ): Promise<{ data: Client[], total: number }> {
    const where: Prisma.ClientWhereInput = hasOrders ? { orders: { some: {} } } : {}
    if (type) {
      where.type = type
    }
    const normalizedSearch = search?.trim() ?? ''
    const orderBy = this.buildOrderBy(sortBy, sortDir)
    if (normalizedSearch) {
      where.OR = [
        { name: buildContainsFilter(normalizedSearch) },
        { email: buildContainsFilter(normalizedSearch) },
        { phone: buildContainsFilter(normalizedSearch) }
      ]
    }
    const total = await this.prisma.client.count({ where })
    const items = await this.prisma.client.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { orders: true } } }
    })
    const data = items.map((c) => ({ ...c, tags: JSON.parse(c.tags), ordersCount: c._count.orders })) as Client[]
    return { data, total }
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.prisma.client.findUnique({ where: { id }, include: { _count: { select: { orders: true } } } })
    if (!client) {
      throw new ApiError(404, 'NOT_FOUND', 'Not Found')
    }
    return { ...client, tags: JSON.parse(client.tags), ordersCount: client._count.orders } as Client
  }

  async create(actorId: string, dto: CreateClientDto): Promise<Client> {
    const normalizedEmail = dto.email?.trim()?.toLowerCase()
    const normalizedPhone = normalizePhone(dto.phone)
    await this.ensureNoDuplicate({ email: normalizedEmail, phone: normalizedPhone, inn: dto.inn })
    const created = await this.prisma.client.create({
      data: {
        name: dto.name.trim(),
        email: normalizedEmail ?? undefined,
        phone: normalizedPhone ?? undefined,
        city: dto.city?.trim(),
        address: dto.address?.trim(),
        managerId: dto.managerId,
        tags: JSON.stringify(dto.tags ?? []),
        type: dto.type,
        inn: dto.inn
      }
    })
    await this.auditService.record(actorId, 'client.created', 'client', created.id)
    return { ...created, tags: JSON.parse(created.tags) } as Client
  }

  async update(actorId: string, id: string, dto: UpdateClientDto): Promise<Client> {
    await this.findOne(id)
    const normalizedEmail = dto.email?.trim()?.toLowerCase()
    const normalizedPhone = normalizePhone(dto.phone)
    await this.ensureNoDuplicate(
      {
        email: normalizedEmail,
        phone: normalizedPhone,
        inn: dto.inn
      },
      id
    )
    const updated = await this.prisma.client.update({
      where: { id },
      data: {
        name: dto.name,
        email: normalizedEmail,
        phone: normalizedPhone,
        city: dto.city,
        address: dto.address,
        managerId: dto.managerId,
        tags: dto.tags ? JSON.stringify(dto.tags) : undefined,
        type: dto.type,
        inn: dto.inn
      }
    })
    await this.auditService.record(actorId, 'client.updated', 'client', id)
    return { ...updated, tags: JSON.parse(updated.tags) } as Client
  }

  async remove(actorId: string, id: string) {
    await this.findOne(id)
    await this.prisma.client.delete({ where: { id } })
    await this.auditService.record(actorId, 'client.deleted', 'client', id)
    return { message: 'Удалено' }
  }

  private async ensureNoDuplicate(values: { email?: string, phone?: string, inn?: string }, excludeId?: string) {
    const conditions: Prisma.ClientWhereInput[] = []
    if (values.email) {
      conditions.push({ email: values.email })
    }
    if (values.phone) {
      conditions.push({ phone: values.phone })
    }
    if (values.inn) {
      conditions.push({ inn: values.inn })
    }
    if (conditions.length === 0) return
    const where: Prisma.ClientWhereInput = { OR: conditions }
    if (excludeId) {
      where.NOT = { id: excludeId }
    }
    const existing = await this.prisma.client.findFirst({ where })
    if (existing) {
      throw new ApiError(409, 'DUPLICATE_CLIENT', 'Клиент уже существует')
    }
  }

  private buildOrderBy(sortBy?: 'name' | 'email' | 'ordersCount' | 'createdAt', sortDir?: 'asc' | 'desc') {
    const direction = sortDir ?? 'desc'
    if (sortBy === 'ordersCount') {
      return { orders: { _count: direction } }
    }
    if (sortBy === 'email') {
      return { email: direction }
    }
    if (sortBy === 'createdAt') {
      return { createdAt: direction }
    }
    return { name: direction }
  }

  private sortClients(data: Client[], sortBy?: 'name' | 'email' | 'ordersCount' | 'createdAt', sortDir?: 'asc' | 'desc') {
    const direction = sortDir === 'desc' ? -1 : 1
    const by = sortBy ?? 'name'
    return [...data].sort((a, b) => {
      if (by === 'ordersCount') {
        const left = a.ordersCount ?? 0
        const right = b.ordersCount ?? 0
        return (left - right) * direction
      }
      if (by === 'createdAt') {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction
      }
      const left = (a[by] ?? '').toString().toLowerCase()
      const right = (b[by] ?? '').toString().toLowerCase()
      return left.localeCompare(right) * direction
    })
  }
}
