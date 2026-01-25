import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { type AuditLog } from '../types/models'
import { AuditQueryDto } from '../../controllers/audit/dto/audit-query.dto'

export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AuditQueryDto): Promise<{ data: AuditLog[], total: number }> {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 20
    const where: any = {}
    if (query.entityType) where.entityType = query.entityType
    if (query.entityId) where.entityId = query.entityId
    if (query.userId) where.actorId = query.userId
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {}
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom)
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo)
    }
    const orderBy = this.buildOrderBy(query.sortBy, query.sortDir)
    const [total, rows] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ])
    return { data: rows as AuditLog[], total }
  }

  async record(actorId: string | null, action: string, entityType: string, entityId?: string, metadata?: Prisma.JsonValue) {
    await this.prisma.auditLog.create({
      data: {
        actorId: actorId ?? 'unknown',
        action,
        entityType,
        entityId,
        metadata: metadata ?? undefined
      }
    })
  }

  private buildOrderBy(sortBy?: 'createdAt' | 'action', sortDir?: 'asc' | 'desc') {
    const direction = sortDir ?? 'desc'
    if (sortBy === 'action') {
      return { action: direction }
    }
    return { createdAt: direction }
  }
}
