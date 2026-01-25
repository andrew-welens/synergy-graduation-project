import { ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { type INestApplication } from '@nestjs/common'
import request from 'supertest'
import { CatalogController } from '../src/modules/catalog/catalog.controller'
import { CatalogService } from '../src/modules/catalog/catalog.service'
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard'
import { RolesGuard } from '../src/common/guards/roles.guard'
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor'
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter'

describe('CatalogController (e2e)', () => {
  let app: INestApplication
  const catalogService = {
    findCategories: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    findProducts: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    createCategory: jest.fn().mockResolvedValue({ id: 'category-1', name: 'Услуги', createdAt: new Date(), updatedAt: new Date() }),
    createProduct: jest.fn().mockResolvedValue({ id: 'product-1', name: 'Абонентская плата', categoryId: 'category-1', price: 100, unit: 'шт', isAvailable: true, createdAt: new Date(), updatedAt: new Date() })
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [{ provide: CatalogService, useValue: catalogService }]
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

  it('GET /api/categories', async () => {
    await request(app.getHttpServer())
      .get('/api/categories')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data.data)).toBe(true)
      })
  })

  it('GET /api/products', async () => {
    await request(app.getHttpServer())
      .get('/api/products')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data.data)).toBe(true)
      })
  })

  it('POST /api/categories invalid', async () => {
    await request(app.getHttpServer())
      .post('/api/categories')
      .send({ name: '' })
      .expect(400)
      .expect((res) => {
        expect(res.body.code).toBe('VALIDATION_ERROR')
      })
  })
})
