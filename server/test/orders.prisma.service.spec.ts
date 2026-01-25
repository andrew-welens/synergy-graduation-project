import { OrdersPrismaService } from '../src/services/orders/orders.prisma.service'
import { OrderStatus } from '../src/services/types/models'
import { type PrismaService } from '../src/services/prisma/prisma.service'
import { ApiError } from '../src/services/common/errors/api-error'

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
    await expect(service.updateStatus('user-1', 'operator', 'order-1', { status: OrderStatus.Done })).rejects.toBeInstanceOf(ApiError)
    await expect(service.updateStatus('user-1', 'operator', 'order-1', { status: OrderStatus.Done })).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 })
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
