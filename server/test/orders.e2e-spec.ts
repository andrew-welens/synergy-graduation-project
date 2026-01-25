import request from 'supertest'
import { OrderStatus } from '../src/services/types/models'
import { createOrdersRouter } from '../src/controllers/orders/orders.controller'
import { type OrdersService } from '../src/services/orders/orders.service'
import { createTestApp } from './utils/create-test-app'
import type { RequestUser } from '../src/services/types/request-user'
import type { PrismaService } from '../src/services/prisma/prisma.service'

describe('OrdersController (e2e)', () => {
  const ordersService: Partial<OrdersService> = {
    findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    findOne: jest.fn().mockResolvedValue({ id: 'order-1', clientId: 'client-1', status: OrderStatus.New, total: 100, items: [], createdAt: new Date(), updatedAt: new Date() }),
    create: jest.fn().mockResolvedValue({ id: 'order-1', clientId: 'client-1', status: OrderStatus.New, total: 100, items: [], createdAt: new Date(), updatedAt: new Date() }),
    updateStatus: jest.fn().mockResolvedValue({ id: 'order-1', clientId: 'client-1', status: OrderStatus.InProgress, total: 100, items: [], createdAt: new Date(), updatedAt: new Date() })
  }
  const user: RequestUser = {
    id: 'user-1',
    email: 'admin@example.com',
    role: 'admin',
    permissions: []
  }
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: user.id, email: user.email, role: user.role })
    }
  } as unknown as PrismaService
  const { app, token } = createTestApp(
    [{ path: '/api/orders', router: createOrdersRouter(ordersService as OrdersService, prisma) }],
    user
  )

  it('POST /api/orders', async () => {
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ clientId: 'client-1', items: [{ productId: 'product-1', quantity: 1, price: 100 }] })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.id).toBe('order-1')
      })
  })

  it('POST /api/orders invalid items', async () => {
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ clientId: 'client-1', items: [{ productId: '', quantity: 0, price: -1 }] })
      .expect(400)
      .expect((res) => {
        expect(res.body.code).toBe('VALIDATION_ERROR')
      })
  })

  it('POST /api/orders/:id/status', async () => {
    await request(app)
      .post('/api/orders/order-1/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: OrderStatus.InProgress })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.status).toBe(OrderStatus.InProgress)
      })
  })

  it('POST /api/orders/:id/status invalid status', async () => {
    await request(app)
      .post('/api/orders/order-1/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'invalid' })
      .expect(400)
      .expect((res) => {
        expect(res.body.code).toBe('VALIDATION_ERROR')
      })
  })
})
