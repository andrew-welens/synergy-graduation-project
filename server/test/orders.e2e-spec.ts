import { ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { type INestApplication } from '@nestjs/common'
import request from 'supertest'
import { OrdersController } from '../src/modules/orders/orders.controller'
import { OrdersService } from '../src/modules/orders/orders.service'
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard'
import { RolesGuard } from '../src/common/guards/roles.guard'
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor'
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter'
import { OrderStatus } from '../src/types/models'

describe('OrdersController (e2e)', () => {
  let app: INestApplication
  const ordersService = {
    findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    findOne: jest.fn().mockResolvedValue({ id: 'order-1', clientId: 'client-1', status: OrderStatus.New, total: 100, items: [], createdAt: new Date(), updatedAt: new Date() }),
    create: jest.fn().mockResolvedValue({ id: 'order-1', clientId: 'client-1', status: OrderStatus.New, total: 100, items: [], createdAt: new Date(), updatedAt: new Date() }),
    updateStatus: jest.fn().mockResolvedValue({ id: 'order-1', clientId: 'client-1', status: OrderStatus.InProgress, total: 100, items: [], createdAt: new Date(), updatedAt: new Date() })
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: ordersService }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    app = moduleRef.createNestApplication()
    app.useGlobalInterceptors(new ResponseInterceptor())
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    )
    app.useGlobalFilters(new ApiExceptionFilter())
    await app.init()
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
  })

  it('POST /api/orders', async () => {
    await request(app.getHttpServer())
      .post('/api/orders')
      .send({ clientId: 'client-1', items: [{ productId: 'product-1', quantity: 1, price: 100 }] })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.id).toBe('order-1')
      })
  })

  it('POST /api/orders invalid items', async () => {
    await request(app.getHttpServer())
      .post('/api/orders')
      .send({ clientId: 'client-1', items: [{ productId: '', quantity: 0, price: -1 }] })
      .expect(400)
      .expect((res) => {
        expect(res.body.code).toBe('VALIDATION_ERROR')
      })
  })

  it('POST /api/orders/:id/status', async () => {
    await request(app.getHttpServer())
      .post('/api/orders/order-1/status')
      .send({ status: OrderStatus.InProgress })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.status).toBe(OrderStatus.InProgress)
      })
  })

  it('POST /api/orders/:id/status invalid status', async () => {
    await request(app.getHttpServer())
      .post('/api/orders/order-1/status')
      .send({ status: 'invalid' })
      .expect(400)
      .expect((res) => {
        expect(res.body.code).toBe('VALIDATION_ERROR')
      })
  })
})
