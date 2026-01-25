import request from 'supertest'
import { createReportsRouter } from '../src/controllers/reports/reports.controller'
import { type ReportsService } from '../src/services/reports/reports.service'
import { createTestApp } from './utils/create-test-app'
import type { RequestUser } from '../src/services/types/request-user'
import type { PrismaService } from '../src/services/prisma/prisma.service'

describe('ReportsController (e2e)', () => {
  const reportsService: Partial<ReportsService> = {
    orders: jest.fn().mockResolvedValue({ groupBy: 'status', data: [] }),
    overdue: jest.fn().mockResolvedValue({ data: [], total: 0, days: 7 })
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
    [{ path: '/api/reports', router: createReportsRouter(reportsService as ReportsService, prisma) }],
    user
  )

  it('GET /api/reports/orders', async () => {
    await request(app)
      .get('/api/reports/orders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data.data)).toBe(true)
      })
  })

  it('GET /api/reports/overdue', async () => {
    await request(app)
      .get('/api/reports/overdue')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data.data)).toBe(true)
      })
  })
})
