import { PrismaService } from '../prisma/prisma.service'
import { OrdersReportQueryDto } from '../../controllers/reports/dto/orders-report-query.dto'
import { OverdueReportQueryDto } from '../../controllers/reports/dto/overdue-report-query.dto'
import { OrderStatus } from '../types/models'
import type { Prisma } from '@prisma/client'
import { CreateAnalyticsReportDto } from '../../controllers/reports/dto/create-analytics-report.dto'
import { ApiError } from '../common/errors/api-error'

export interface AnalyticsReportRow {
  id: string
  userId: string
  name: string
  reportType: string
  params: Record<string, unknown> | null
  createdAt: Date
}

export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async orders(query: OrdersReportQueryDto) {
    const where: Prisma.OrderWhereInput = {}
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
        key: (r[groupField as keyof typeof r] as string | null) ?? 'unassigned',
        count: r._count._all,
        total: r._sum.total ?? 0
      }))
    }
  }

  async exportData(query: OrdersReportQueryDto) {
    const summary = await this.orders(query)
    const where: Prisma.OrderWhereInput = {}
    if (query.status) where.status = query.status
    if (query.managerId) where.managerId = query.managerId
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {}
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom)
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo)
    }
    const orderRows = await this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        items: true,
        client: { select: { name: true } },
        manager: { select: { firstName: true, lastName: true, email: true } }
      }
    })
    const orders = orderRows.map((row) => {
      const managerName = row.manager?.firstName || row.manager?.lastName
        ? [row.manager.firstName, row.manager.lastName].filter(Boolean).join(' ').trim() || row.manager?.email
        : row.manager?.email
      return {
        id: row.id,
        clientId: row.clientId,
        clientName: row.client?.name,
        status: row.status,
        total: row.total,
        totalAmount: row.total,
        comments: row.comments ?? undefined,
        managerId: row.managerId ?? undefined,
        managerName: managerName ?? undefined,
        managerEmail: row.manager?.email ?? undefined,
        createdAt: row.createdAt,
        completedAt: row.completedAt ?? undefined,
        items: row.items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price, total: i.total }))
      }
    })
    const products = await this.prisma.product.findMany({ select: { id: true, name: true } })
    const clientRows = await this.prisma.client.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { orders: true, interactions: true } } }
    })
    const clients = clientRows.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email ?? undefined,
      phone: c.phone ?? undefined,
      city: c.city ?? undefined,
      address: c.address ?? undefined,
      type: c.type,
      inn: c.inn ?? undefined,
      tags: JSON.parse(c.tags) as string[],
      ordersCount: c._count.orders,
      interactionsCount: c._count.interactions,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }))
    return { summary, orders, products, clients }
  }

  async overdue(query: OverdueReportQueryDto) {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 20
    const days = query.days ?? 7
    const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const where: Prisma.OrderWhereInput = {
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
