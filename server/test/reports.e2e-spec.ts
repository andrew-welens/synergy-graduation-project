import { ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { type INestApplication } from '@nestjs/common'
import request from 'supertest'
import { ReportsController } from '../src/modules/reports/reports.controller'
import { ReportsService } from '../src/modules/reports/reports.service'
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard'
import { RolesGuard } from '../src/common/guards/roles.guard'
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor'
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter'

describe('ReportsController (e2e)', () => {
  let app: INestApplication
  const reportsService = {
    orders: jest.fn().mockResolvedValue({ groupBy: 'status', data: [] }),
    overdue: jest.fn().mockResolvedValue({ data: [], total: 0, days: 7 })
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: reportsService }]
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

  it('GET /api/reports/orders', async () => {
    await request(app.getHttpServer())
      .get('/api/reports/orders')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data.data)).toBe(true)
      })
  })

  it('GET /api/reports/overdue', async () => {
    await request(app.getHttpServer())
      .get('/api/reports/overdue')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data.data)).toBe(true)
      })
  })
})
