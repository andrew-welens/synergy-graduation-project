import request from 'supertest'
import { createCatalogRouter } from '../src/controllers/catalog/catalog.controller'
import { type CatalogService } from '../src/services/catalog/catalog.service'
import { createTestApp } from './utils/create-test-app'
import type { RequestUser } from '../src/services/types/request-user'
import type { PrismaService } from '../src/services/prisma/prisma.service'

describe('CatalogController (e2e)', () => {
  const catalogService: Partial<CatalogService> = {
    findCategories: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    findProducts: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    createCategory: jest.fn().mockResolvedValue({ id: 'category-1', name: 'Услуги', createdAt: new Date(), updatedAt: new Date() }),
    createProduct: jest.fn().mockResolvedValue({ id: 'product-1', name: 'Абонентская плата', categoryId: 'category-1', price: 100, unit: 'шт', isAvailable: true, createdAt: new Date(), updatedAt: new Date() })
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
    [{ path: '/api', router: createCatalogRouter(catalogService as CatalogService, prisma) }],
    user
  )

  it('GET /api/categories', async () => {
    await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data.data)).toBe(true)
      })
  })

  it('GET /api/products', async () => {
    await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data.data)).toBe(true)
      })
  })

  it('POST /api/categories invalid', async () => {
    await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' })
      .expect(400)
      .expect((res) => {
        expect(res.body.code).toBe('VALIDATION_ERROR')
      })
  })
})
