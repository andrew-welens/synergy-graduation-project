import type { Express } from 'express'
import { PrismaService } from '../services/prisma/prisma.service'
import { createAuthRouter } from '../controllers/auth/auth.controller'
import { createUsersRouter } from '../controllers/users/users.controller'
import { createClientsRouter } from '../controllers/clients/clients.controller'
import { createCatalogRouter } from '../controllers/catalog/catalog.controller'
import { createOrdersRouter } from '../controllers/orders/orders.controller'
import { createInteractionsRouter } from '../controllers/interactions/interactions.controller'
import { createAuditRouter } from '../controllers/audit/audit.controller'
import { createReportsRouter } from '../controllers/reports/reports.controller'
import { createHealthRouter } from '../controllers/health/health.controller'
import { AuthService } from '../services/auth/auth.service'
import { UsersService } from '../services/users/users.service'
import { ClientsService } from '../services/clients/clients.service'
import { CatalogService } from '../services/catalog/catalog.service'
import { OrdersService } from '../services/orders/orders.service'
import { InteractionsService } from '../services/interactions/interactions.service'
import { AuditService } from '../services/audit/audit.service'
import { ReportsService } from '../services/reports/reports.service'

interface RouteServices {
  authService: AuthService
  usersService: UsersService
  clientsService: ClientsService
  catalogService: CatalogService
  ordersService: OrdersService
  interactionsService: InteractionsService
  auditService: AuditService
  reportsService: ReportsService
}

export const registerRoutes = (app: Express, prisma: PrismaService, services: RouteServices) => {
  app.use('/health', createHealthRouter(prisma))
  app.use('/api/auth', createAuthRouter(services.authService, prisma))
  app.use('/api/users', createUsersRouter(services.usersService, prisma))
  app.use('/api/clients', createClientsRouter(services.clientsService, prisma))
  app.use('/api/clients/:clientId/interactions', createInteractionsRouter(services.interactionsService, prisma))
  app.use('/api/orders', createOrdersRouter(services.ordersService, prisma))
  app.use('/api/audit', createAuditRouter(services.auditService, prisma))
  app.use('/api/reports', createReportsRouter(services.reportsService, prisma))
  app.use('/api', createCatalogRouter(services.catalogService, prisma))
}
