import request from 'supertest'
import { createUsersRouter } from '../src/controllers/users/users.controller'
import { type UsersService } from '../src/services/users/users.service'
import { createTestApp } from './utils/create-test-app'
import type { RequestUser } from '../src/services/types/request-user'
import type { PrismaService } from '../src/services/prisma/prisma.service'

describe('UsersController (e2e)', () => {
  const usersService: Partial<UsersService> = {
    list: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 'user-1', email: 'user@example.com', role: 'manager', createdAt: new Date() })
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
    [{ path: '/api/users', router: createUsersRouter(usersService as UsersService, prisma) }],
    user
  )

  it('GET /api/users', async () => {
    await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data)).toBe(true)
      })
  })

  it('POST /api/users invalid email', async () => {
    await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'not-email', password: 'password123', role: 'manager' })
      .expect(400)
      .expect((res) => {
        expect(res.body.code).toBe('VALIDATION_ERROR')
      })
  })
})

describe('UsersController forbidden (e2e)', () => {
  const usersService: Partial<UsersService> = {
    list: jest.fn().mockResolvedValue([])
  }
  const user: RequestUser = {
    id: 'user-2',
    email: 'analyst@example.com',
    role: 'analyst',
    permissions: []
  }
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: user.id, email: user.email, role: user.role })
    }
  } as unknown as PrismaService
  const { app, token } = createTestApp(
    [{ path: '/api/users', router: createUsersRouter(usersService as UsersService, prisma) }],
    user
  )

  it('GET /api/users forbidden', async () => {
    await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
      .expect((res) => {
        expect(res.body.code).toBe('FORBIDDEN')
      })
  })
})
