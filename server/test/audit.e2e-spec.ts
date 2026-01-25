import request from 'supertest'
import { createAuditRouter } from '../src/controllers/audit/audit.controller'
import { type AuditService } from '../src/services/audit/audit.service'
import { createTestApp } from './utils/create-test-app'
import type { RequestUser } from '../src/services/types/request-user'
import type { PrismaService } from '../src/services/prisma/prisma.service'

describe('AuditController (e2e)', () => {
  const auditService: Partial<AuditService> = {
    list: jest.fn().mockResolvedValue({ data: [], total: 0 })
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
    [{ path: '/api/audit', router: createAuditRouter(auditService as AuditService, prisma) }],
    user
  )

  it('GET /api/audit', async () => {
    await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data.data)).toBe(true)
      })
  })

  it('GET /api/audit invalid date', async () => {
    await request(app)
      .get('/api/audit?dateFrom=bad-date')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .expect((res) => {
        expect(res.body.code).toBe('VALIDATION_ERROR')
      })
  })
})
