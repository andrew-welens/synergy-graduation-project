import { ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { type INestApplication } from '@nestjs/common'
import request from 'supertest'
import { UsersController } from '../src/modules/users/users.controller'
import { UsersService } from '../src/modules/users/users.service'
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard'
import { RolesGuard } from '../src/common/guards/roles.guard'
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor'
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter'

describe('UsersController (e2e)', () => {
  let app: INestApplication
  const usersService = {
    list: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 'user-1', email: 'user@example.com', role: 'manager', createdAt: new Date() })
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }]
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

  it('GET /api/users', async () => {
    await request(app.getHttpServer())
      .get('/api/users')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data)).toBe(true)
      })
  })

  it('POST /api/users invalid email', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({ email: 'not-email', password: 'password123', role: 'manager' })
      .expect(400)
      .expect((res) => {
        expect(res.body.code).toBe('VALIDATION_ERROR')
      })
  })
})

describe('UsersController forbidden (e2e)', () => {
  let app: INestApplication
  const usersService = {
    list: jest.fn().mockResolvedValue([])
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => false })
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

  it('GET /api/users forbidden', async () => {
    await request(app.getHttpServer())
      .get('/api/users')
      .expect(403)
      .expect((res) => {
        expect(res.body.code).toBe('FORBIDDEN')
      })
  })
})
