import { ForbiddenException } from '@nestjs/common'
import { OrdersPrismaService } from '../src/modules/orders/orders.prisma.service'
import { OrderStatus } from '../src/types/models'
import { type PrismaService } from '../src/prisma/prisma.service'

const createService = () => {
  const prisma = {
    order: {
      update: jest.fn()
    }
  } as unknown as PrismaService
  const service = new OrdersPrismaService(prisma)
  return { service, prisma }
}

describe('OrdersPrismaService', () => {
  it('запрещает переход статуса для оператора', async () => {
    const { service, prisma } = createService()
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'order-1',
      clientId: 'client-1',
      status: OrderStatus.New,
      total: 100,
      totalAmount: 100,
      comments: undefined,
      managerId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: undefined,
      items: []
    })
    await expect(service.updateStatus('user-1', 'operator', 'order-1', { status: OrderStatus.Done })).rejects.toBeInstanceOf(ForbiddenException)
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it('разрешает переход статуса для администратора', async () => {
    const { service, prisma } = createService()
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'order-1',
      clientId: 'client-1',
      status: OrderStatus.New,
      total: 100,
      totalAmount: 100,
      comments: undefined,
      managerId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: undefined,
      items: []
    })
    prisma.order.update = jest.fn().mockResolvedValue({
      id: 'order-1',
      clientId: 'client-1',
      status: OrderStatus.InProgress,
      total: 100,
      totalAmount: 100,
      comments: null,
      managerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
      items: [],
      history: []
    })
    const result = await service.updateStatus('user-1', 'admin', 'order-1', { status: OrderStatus.InProgress })
    expect(result.status).toBe(OrderStatus.InProgress)
  })
})
