import { OrdersPrismaService } from '../src/services/orders/orders.prisma.service'
import { OrderStatus } from '../src/services/types/models'
import { type PrismaService } from '../src/services/prisma/prisma.service'
import { ApiError } from '../src/services/common/errors/api-error'

const createService = () => {
  const mockOrder = {
    id: 'order-1',
    clientId: 'client-1',
    status: OrderStatus.New,
    total: 100,
    comments: null,
    managerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    items: [],
    history: [],
    client: { name: 'Test Client' },
    manager: null
  }
  const prisma = {
    order: {
      findUnique: jest.fn().mockResolvedValue(mockOrder),
      update: jest.fn().mockResolvedValue({ ...mockOrder, status: OrderStatus.InProgress })
    },
    $transaction: jest.fn(async (callback: any) => {
      const tx = {
        order: {
          findUnique: prisma.order.findUnique,
          update: prisma.order.update
        },
        client: {
          findUnique: jest.fn()
        },
        product: {
          findMany: jest.fn().mockResolvedValue([])
        }
      }
      return await callback(tx)
    })
  } as unknown as PrismaService
  const service = new OrdersPrismaService(prisma)
  return { service, prisma }
}

describe('OrdersPrismaService', () => {
  it('запрещает переход статуса для оператора', async () => {
    const { service, prisma } = createService()
    await expect(service.updateStatus('user-1', 'operator', 'order-1', { status: OrderStatus.Done })).rejects.toBeInstanceOf(ApiError)
    await expect(service.updateStatus('user-1', 'operator', 'order-1', { status: OrderStatus.Done })).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 })
    expect(prisma.$transaction).toHaveBeenCalled()
  })

  it('разрешает переход статуса для администратора', async () => {
    const { service, prisma } = createService()
    const result = await service.updateStatus('user-1', 'admin', 'order-1', { status: OrderStatus.InProgress })
    expect(result.status).toBe(OrderStatus.InProgress)
    expect(prisma.$transaction).toHaveBeenCalled()
    expect(prisma.order.update).toHaveBeenCalled()
  })
})
