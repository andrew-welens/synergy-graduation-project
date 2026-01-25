import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { type Interaction } from '../../types/models'
import { CreateInteractionDto } from './dto/create-interaction.dto'
import { InteractionsQueryDto } from './dto/interactions-query.dto'
import { AuditService } from '../audit/audit.service'
import { UpdateInteractionDto } from './dto/update-interaction.dto'

@Injectable()
export class InteractionsService {
  constructor(private readonly prisma: PrismaService, private readonly auditService: AuditService) {}

  async list(clientId: string, query: InteractionsQueryDto): Promise<{ data: Interaction[], total: number }> {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 20
    const where: any = { clientId }
    if (query.channel) where.channel = query.channel
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {}
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom)
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo)
    }
    const orderBy = this.buildOrderBy(query.sortBy, query.sortDir)
    const [total, rows] = await Promise.all([
      this.prisma.interaction.count({ where }),
      this.prisma.interaction.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ])
    return { data: rows as Interaction[], total }
  }

  async create(actorId: string, clientId: string, dto: CreateInteractionDto): Promise<Interaction> {
    const client = await this.prisma.client.findUnique({ where: { id: clientId } })
    if (!client) {
      throw new BadRequestException('Клиент не найден')
    }
    const interaction = await this.prisma.interaction.create({
      data: {
        clientId,
        channel: dto.channel,
        description: dto.description,
        managerId: dto.managerId
      }
    })
    await this.auditService.record(actorId, 'interaction.created', 'interaction', interaction.id, { clientId })
    return interaction as Interaction
  }

  async update(actorId: string, clientId: string, id: string, dto: UpdateInteractionDto): Promise<Interaction> {
    const interaction = await this.prisma.interaction.findUnique({ where: { id } })
    if (!interaction || interaction.clientId !== clientId) {
      throw new NotFoundException()
    }
    const updated = await this.prisma.interaction.update({
      where: { id },
      data: {
        channel: dto.channel ?? interaction.channel,
        description: dto.description ?? interaction.description
      }
    })
    await this.auditService.record(actorId, 'interaction.updated', 'interaction', id, { clientId })
    return updated as Interaction
  }

  async remove(actorId: string, clientId: string, id: string) {
    const interaction = await this.prisma.interaction.findUnique({ where: { id } })
    if (!interaction || interaction.clientId !== clientId) {
      throw new NotFoundException()
    }
    await this.prisma.interaction.delete({ where: { id } })
    await this.auditService.record(actorId, 'interaction.deleted', 'interaction', id, { clientId })
    return { message: 'Удалено' }
  }

  private buildOrderBy(sortBy?: 'createdAt' | 'channel', sortDir?: 'asc' | 'desc') {
    const direction = sortDir ?? 'desc'
    if (sortBy === 'channel') {
      return { channel: direction }
    }
    return { createdAt: direction }
  }
}
