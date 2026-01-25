import { Injectable } from '@nestjs/common'
import { type Order } from '../../types/models'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateStatusDto } from './dto/update-status.dto'
import { OrdersQueryDto } from './dto/orders-query.dto'
import { OrdersPrismaService } from './orders.prisma.service'
import { AuditService } from '../audit/audit.service'
import { UpdateOrderDto } from './dto/update-order.dto'

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: OrdersPrismaService, private readonly auditService: AuditService) {}

  findAll(query: OrdersQueryDto) {
    return this.prismaService.findAll(query)
  }

  findOne(id: string) {
    return this.prismaService.findOne(id)
  }

  async create(actorId: string, dto: CreateOrderDto) {
    const order = await this.prismaService.create(actorId, dto)
    await this.auditService.record(actorId, 'order.created', 'order', order.id)
    return order
  }

  async updateStatus(actorId: string, role: string, id: string, dto: UpdateStatusDto) {
    const updated = await this.prismaService.updateStatus(actorId, role, id, dto)
    await this.auditService.record(actorId, 'order.status.changed', 'order', id, { status: dto.status })
    return updated
  }

  async update(actorId: string, role: string, id: string, dto: UpdateOrderDto) {
    const updated = await this.prismaService.update(actorId, role, id, dto)
    await this.auditService.record(actorId, 'order.updated', 'order', id)
    return updated
  }
}
