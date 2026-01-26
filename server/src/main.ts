import 'reflect-metadata'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import { PrismaService } from './services/prisma/prisma.service'
import { BootstrapService } from './services/bootstrap/bootstrap.service'
import { AuditService } from './services/audit/audit.service'
import { ReportsService } from './services/reports/reports.service'
import { ClientsService } from './services/clients/clients.service'
import { CatalogService } from './services/catalog/catalog.service'
import { UsersService } from './services/users/users.service'
import { OrdersPrismaService } from './services/orders/orders.prisma.service'
import { OrdersService } from './services/orders/orders.service'
import { InteractionsService } from './services/interactions/interactions.service'
import { AuthService } from './services/auth/auth.service'
import { registerRoutes } from './routes'
import { errorHandler } from './middleware/error-handler'
import { openapiSpec } from './config/openapi'

const bootstrap = async () => {
  dotenv.config()
  
  const isTestEnv = process.env.NODE_ENV === 'test' || process.env.CYPRESS === 'true' || process.argv.includes('--test')
  if (isTestEnv) {
    process.env.NODE_ENV = 'test'
    process.env.CYPRESS = 'true'
    console.log('✓ Running in TEST mode - rate limiting DISABLED')
  }

  const prisma = new PrismaService()
  await prisma.connect()

  const bootstrapService = new BootstrapService(prisma)
  await bootstrapService.init()

  const auditService = new AuditService(prisma)
  const reportsService = new ReportsService(prisma)
  const clientsService = new ClientsService(prisma, auditService)
  const catalogService = new CatalogService(prisma, auditService)
  const usersService = new UsersService(prisma, auditService)
  const ordersPrismaService = new OrdersPrismaService(prisma)
  const ordersService = new OrdersService(ordersPrismaService, auditService)
  const interactionsService = new InteractionsService(prisma, auditService)
  const authService = new AuthService(prisma, auditService)

  const app = express()
  app.use(express.json())
  app.use(cookieParser())
  app.use(cors({ origin: ['http://localhost:5173'], credentials: true }))
  
  const isTestMode = process.env.NODE_ENV === 'test' || process.env.CYPRESS === 'true'
  if (!isTestMode) {
    app.use(rateLimit({ 
      windowMs: 60 * 1000, 
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false
    }))
  } else {
    console.log('✓ Global rate limiting DISABLED for tests')
  }

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec))
  registerRoutes(app, prisma, {
    authService,
    usersService,
    clientsService,
    catalogService,
    ordersService,
    interactionsService,
    auditService,
    reportsService
  })

  app.use(errorHandler)

  const port = process.env.PORT ?? 3000
  app.listen(port, () => {
    process.stdout.write(`Server listening on ${port}\n`)
  })

  const shutdown = async () => {
    await prisma.disconnect()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

void bootstrap()
