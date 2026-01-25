import { PrismaService } from '../prisma/prisma.service'
import { OrderStatus, type Order, type OrderItem, type Role } from '../types/models'
import { CreateOrderDto } from '../../controllers/orders/dto/create-order.dto'
import { UpdateStatusDto } from '../../controllers/orders/dto/update-status.dto'
import { OrdersQueryDto } from '../../controllers/orders/dto/orders-query.dto'
import { UpdateOrderDto } from '../../controllers/orders/dto/update-order.dto'
import { ApiError } from '../common/errors/api-error'

export class OrdersPrismaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: OrdersQueryDto): Promise<{ data: Order[], total: number }> {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 20
    const where: any = {}
    if (query.status) where.status = query.status
    if (query.clientId) where.clientId = query.clientId
    if (query.managerId) where.managerId = query.managerId
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {}
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom)
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo)
    }
    const [total, rows] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: this.buildOrderBy(query.sortBy, query.sortDir),
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { items: true, history: true, client: { select: { name: true } }, manager: { select: { name: true, email: true } } }
      })
    ])
    return { data: rows.map((row) => this.mapOrder(row)) as unknown as Order[], total }
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true, history: true, client: { select: { name: true } }, manager: { select: { name: true, email: true } } } })
    if (!order) {
      throw new ApiError(404, 'NOT_FOUND', 'Not Found')
    }
    return this.mapOrder(order) as unknown as Order
  }

  async create(actorId: string, dto: CreateOrderDto): Promise<Order> {
    const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } })
    if (!client) {
      throw new ApiError(404, 'NOT_FOUND', 'Клиент не найден')
    }
    const items = await this.resolveItems(dto.items)
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const status = dto.status ?? OrderStatus.New
    const order = await this.prisma.order.create({
      data: {
        clientId: dto.clientId,
        status,
        comments: dto.comments?.trim() || undefined,
        managerId: dto.managerId,
        total,
        completedAt: status === OrderStatus.Done || status === OrderStatus.Canceled ? new Date() : undefined,
        items: {
          create: items.map((i) => ({ productId: i.productId, price: i.price, quantity: i.quantity }))
        },
        history: {
          create: [
            {
              status,
              actorId
            }
          ]
        }
      },
      include: { items: true, history: true, client: { select: { name: true } }, manager: { select: { name: true, email: true } } }
    })
    return this.mapOrder(order) as unknown as Order
  }

  async updateStatus(actorId: string, role: string, id: string, dto: UpdateStatusDto): Promise<Order> {
    const order = await this.findOne(id)
    this.ensureStatusTransition(order.status, dto.status, role as any)
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        completedAt: dto.status === OrderStatus.Done || dto.status === OrderStatus.Canceled ? new Date() : order.completedAt,
        history: {
          create: [
            {
              status: dto.status,
              actorId
            }
          ]
        }
      },
      include: { items: true, history: true, client: { select: { name: true } }, manager: { select: { name: true, email: true } } }
    })
    return this.mapOrder(updated) as unknown as Order
  }

  async update(actorId: string, role: string, id: string, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id)
    this.ensureUpdateAllowed(role as Role)
    this.ensureEditable(order.status)
    const hasItems = Array.isArray(dto.items)
    const items = hasItems ? await this.resolveItems(dto.items ?? []) : order.items
    const total = hasItems ? items.reduce((sum, i) => sum + i.price * i.quantity, 0) : order.total
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        managerId: dto.managerId ?? order.managerId,
        comments: dto.comments !== undefined ? dto.comments.trim() : order.comments,
        ...(hasItems
          ? {
            total,
            items: {
              deleteMany: {},
              create: items.map((i) => ({ productId: i.productId, price: i.price, quantity: i.quantity }))
            }
          }
          : {})
      },
      include: { items: true, history: true, client: { select: { name: true } }, manager: { select: { name: true, email: true } } }
    })
    return this.mapOrder(updated) as unknown as Order
  }

  private async resolveItems(items: { productId: string, quantity: number, price: number }[]): Promise<OrderItem[]> {
    if (!items.length) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Нужны позиции заказа')
    }
    const productIds = items.map((i) => i.productId)
    const products = await this.prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, isAvailable: true } })
    const map = new Map(products.map((p) => [p.id, p]))
    return items.map((i) => {
      const product = map.get(i.productId)
      if (!product) {
        throw new ApiError(404, 'NOT_FOUND', `Товар ${i.productId} не найден`)
      }
      if (!product.isAvailable) {
        throw new ApiError(409, 'VALIDATION_ERROR', `Товар ${i.productId} недоступен`)
      }
      if (i.quantity <= 0) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Количество должно быть больше 0')
      }
      if (i.price < 0) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Цена не может быть отрицательной')
      }
      return { productId: i.productId, quantity: i.quantity, price: i.price }
    })
  }

  private ensureStatusTransition(current: OrderStatus, next: OrderStatus, role: Role) {
    const allowed: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.New]: [OrderStatus.InProgress, OrderStatus.Done, OrderStatus.Canceled],
      [OrderStatus.InProgress]: [OrderStatus.Done, OrderStatus.Canceled],
      [OrderStatus.Done]: [],
      [OrderStatus.Canceled]: []
    }
    const options = allowed[current] ?? []
    if (!options.includes(next)) {
      throw new ApiError(409, 'STATUS_TRANSITION_FORBIDDEN', `Переход статуса ${current} → ${next} запрещен`)
    }
    if (role === 'analyst') {
      throw new ApiError(403, 'FORBIDDEN', 'Аналитик не может менять статус')
    }
    if (role === 'operator') {
      const operatorAllowed: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.New]: [OrderStatus.InProgress],
        [OrderStatus.InProgress]: [],
        [OrderStatus.Done]: [],
        [OrderStatus.Canceled]: []
      }
      const operatorOptions = operatorAllowed[current] ?? []
      if (!operatorOptions.includes(next)) {
        throw new ApiError(403, 'FORBIDDEN', 'Оператор не может выполнить этот переход')
      }
    }
  }

  private ensureEditable(status: OrderStatus) {
    if (status === OrderStatus.Done || status === OrderStatus.Canceled) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Заказ нельзя редактировать')
    }
  }

  private ensureUpdateAllowed(role: Role) {
    if (role === 'operator' || role === 'analyst') {
      throw new ApiError(403, 'FORBIDDEN', 'Недостаточно прав для редактирования заказа')
    }
  }

  private buildOrderBy(sortBy?: 'status' | 'total' | 'createdAt', sortDir?: 'asc' | 'desc') {
    const direction = sortDir ?? 'desc'
    if (sortBy === 'status') {
      return { status: direction }
    }
    if (sortBy === 'total') {
      return { total: direction }
    }
    return { createdAt: direction }
  }

  private mapOrder(order: { total: number, client?: { name: string } | null, manager?: { name: string | null, email: string } | null }) {
    const { client, manager, ...rest } = order as { total: number, client?: { name: string } | null, manager?: { name: string | null, email: string } | null, [key: string]: unknown }
    return {
      ...rest,
      totalAmount: order.total,
      clientName: client?.name,
      managerName: manager?.name ?? undefined,
      managerEmail: manager?.email
    }
  }
}
