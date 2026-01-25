import request from 'supertest'
import { createClientsRouter } from '../src/controllers/clients/clients.controller'
import { type ClientsService } from '../src/services/clients/clients.service'
import { createTestApp } from './utils/create-test-app'
import type { RequestUser } from '../src/services/types/request-user'
import type { PrismaService } from '../src/services/prisma/prisma.service'

describe('ClientsController (e2e)', () => {
  const clientsService: Partial<ClientsService> = {
    findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    findOne: jest.fn().mockResolvedValue({ id: 'client-1', name: 'ООО Ромашка', tags: [], type: 'legal', createdAt: new Date(), updatedAt: new Date() }),
    create: jest.fn().mockResolvedValue({ id: 'client-1', name: 'ООО Ромашка', tags: [], type: 'legal', createdAt: new Date(), updatedAt: new Date() })
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
    [{ path: '/api/clients', router: createClientsRouter(clientsService as ClientsService, prisma) }],
    user
  )

  it('POST /api/clients', async () => {
    await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ООО Ромашка', email: 'info@romashka.ru', type: 'legal', inn: '7700000000', tags: [] })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.id).toBe('client-1')
      })
  })

  it('POST /api/clients invalid email', async () => {
    await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ООО Ромашка', email: 'not-email', type: 'legal', inn: '7700000000' })
      .expect(400)
      .expect((res) => {
        expect(res.body.code).toBe('VALIDATION_ERROR')
      })
  })

  it('GET /api/clients', async () => {
    await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data.data)).toBe(true)
      })
  })

  it('GET /api/clients/:id', async () => {
    await request(app)
      .get('/api/clients/client-1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.id).toBe('client-1')
      })
  })
})
