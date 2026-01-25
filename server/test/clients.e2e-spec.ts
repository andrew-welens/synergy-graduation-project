import { ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { type INestApplication } from '@nestjs/common'
import request from 'supertest'
import { ClientsController } from '../src/modules/clients/clients.controller'
import { ClientsService } from '../src/modules/clients/clients.service'
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard'
import { RolesGuard } from '../src/common/guards/roles.guard'
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor'
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter'

describe('ClientsController (e2e)', () => {
  let app: INestApplication
  const clientsService = {
    findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    findOne: jest.fn().mockResolvedValue({ id: 'client-1', name: 'ООО Ромашка', tags: [], type: 'legal', createdAt: new Date(), updatedAt: new Date() }),
    create: jest.fn().mockResolvedValue({ id: 'client-1', name: 'ООО Ромашка', tags: [], type: 'legal', createdAt: new Date(), updatedAt: new Date() })
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        { provide: ClientsService, useValue: clientsService }
      ]
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

  it('POST /api/clients', async () => {
    await request(app.getHttpServer())
      .post('/api/clients')
      .send({ name: 'ООО Ромашка', email: 'info@romashka.ru', type: 'legal', inn: '7700000000', tags: [] })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.id).toBe('client-1')
      })
  })

  it('POST /api/clients invalid email', async () => {
    await request(app.getHttpServer())
      .post('/api/clients')
      .send({ name: 'ООО Ромашка', email: 'not-email', type: 'legal', inn: '7700000000' })
      .expect(400)
      .expect((res) => {
        expect(res.body.code).toBe('VALIDATION_ERROR')
      })
  })

  it('GET /api/clients', async () => {
    await request(app.getHttpServer())
      .get('/api/clients')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data.data)).toBe(true)
      })
  })

  it('GET /api/clients/:id', async () => {
    await request(app.getHttpServer())
      .get('/api/clients/client-1')
      .expect(200)
      .expect((res) => {
        expect(res.body.data.id).toBe('client-1')
      })
  })
})
