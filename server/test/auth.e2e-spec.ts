import request from 'supertest'
import { createAuthRouter } from '../src/controllers/auth/auth.controller'
import { type AuthService } from '../src/services/auth/auth.service'
import { createTestApp } from './utils/create-test-app'
import type { RequestUser } from '../src/services/types/request-user'
import type { PrismaService } from '../src/services/prisma/prisma.service'

describe('AuthController (e2e)', () => {
  const authService: Pick<AuthService, 'login' | 'refresh'> = {
    login: jest.fn().mockResolvedValue({ accessToken: 'access-token', refreshToken: 'refresh-token' }),
    refresh: jest.fn().mockResolvedValue({ accessToken: 'new-access-token' })
  }
  const user: RequestUser = {
    id: 'user-1',
    email: 'user@example.com',
    role: 'admin',
    permissions: ['clients.read']
  }
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: user.id, email: user.email, role: user.role })
    }
  } as unknown as PrismaService
  const { app, token } = createTestApp(
    [{ path: '/api/auth', router: createAuthRouter(authService as AuthService, prisma) }],
    user
  )

  it('POST /api/auth/login', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.accessToken).toBe('access-token')
        expect(res.body.data.refreshToken).toBe('refresh-token')
      })
  })

  it('POST /api/auth/refresh', async () => {
    await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'refresh-token' })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.accessToken).toBe('new-access-token')
      })
  })

  it('POST /api/auth/logout', async () => {
    await request(app)
      .post('/api/auth/logout')
      .expect(200)
      .expect((res) => {
        expect(res.body.data.ok).toBe(true)
      })
  })

  it('GET /api/auth/me', async () => {
    await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.id).toBe('user-1')
        expect(res.body.data.role).toBe('admin')
      })
  })
})
