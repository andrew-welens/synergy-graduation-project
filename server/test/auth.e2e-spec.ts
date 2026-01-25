import { type ExecutionContext, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { type INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AuthController } from '../src/modules/auth/auth.controller'
import { AuthService } from '../src/modules/auth/auth.service'
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor'
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  const authGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest()
      req.user = {
        id: 'user-1',
        email: 'user@example.com',
        role: 'admin',
        permissions: ['clients.read']
      }
      return true
    }
  }
  const authService = {
    login: jest.fn().mockResolvedValue({ accessToken: 'access-token', refreshToken: 'refresh-token' }),
    refresh: jest.fn().mockResolvedValue({ accessToken: 'new-access-token' })
  }
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(authGuard)
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
    await app.init()
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
  })

  it('POST /api/auth/login', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.accessToken).toBe('access-token')
        expect(res.body.data.refreshToken).toBe('refresh-token')
      })
  })

  it('POST /api/auth/refresh', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: 'refresh-token' })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.accessToken).toBe('new-access-token')
      })
  })

  it('POST /api/auth/logout', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .expect(200)
      .expect((res) => {
        expect(res.body.data.ok).toBe(true)
      })
  })

  it('GET /api/auth/me', async () => {
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .expect(200)
      .expect((res) => {
        expect(res.body.data.id).toBe('user-1')
        expect(res.body.data.role).toBe('admin')
      })
  })
})
