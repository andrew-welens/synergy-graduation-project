import { PrismaService } from '../prisma/prisma.service'
import { OrdersReportQueryDto } from '../../controllers/reports/dto/orders-report-query.dto'
import { OverdueReportQueryDto } from '../../controllers/reports/dto/overdue-report-query.dto'
import { OrderStatus } from '../types/models'

export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async orders(query: OrdersReportQueryDto) {
    const where: any = {}
    if (query.status) where.status = query.status
    if (query.managerId) where.managerId = query.managerId
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {}
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom)
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo)
    }
    const groupBy = query.groupBy ?? 'status'
    if (groupBy === 'day') {
      const rows = await this.prisma.order.findMany({ where, select: { id: true, status: true, total: true, createdAt: true } })
      const map = new Map<string, { count: number, total: number }>()
      rows.forEach((row) => {
        const key = row.createdAt.toISOString().slice(0, 10)
        const current = map.get(key) ?? { count: 0, total: 0 }
        map.set(key, { count: current.count + 1, total: current.total + row.total })
      })
      return { groupBy: 'day', data: Array.from(map.entries()).map(([key, value]) => ({ key, ...value })) }
    }
    const groupField = groupBy === 'manager' ? 'managerId' : 'status'
    const rows = await this.prisma.order.groupBy({
      by: [groupField],
      where,
      _count: { _all: true },
      _sum: { total: true }
    })
    return {
      groupBy,
      data: rows.map((r) => ({
        key: (r as any)[groupField] ?? 'unassigned',
        count: (r as any)._count._all,
        total: (r as any)._sum.total ?? 0
      }))
    }
  }

  async overdue(query: OverdueReportQueryDto) {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 20
    const days = query.days ?? 7
    const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const where: any = {
      status: { notIn: [OrderStatus.Done, OrderStatus.Canceled] },
      createdAt: { lte: threshold }
    }
    if (query.status) {
      where.status = query.status
    }
    if (query.managerId) {
      where.managerId = query.managerId
    }
    const [total, rows] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          clientId: true,
          status: true,
          total: true,
          managerId: true,
          createdAt: true,
          client: { select: { name: true } }
        }
      })
    ])
    const data = rows.map((row) => ({ ...row, clientName: row.client?.name }))
    return { data, total, days }
  }
}
