import { Router } from 'express'
import { ReportsService } from '../../services/reports/reports.service'
import { OrdersReportQueryDto } from './dto/orders-report-query.dto'
import { OverdueReportQueryDto } from './dto/overdue-report-query.dto'
import { asyncHandler } from '../../middleware/async-handler'
import { validateQuery } from '../../middleware/validate'
import { requireAuth } from '../../middleware/auth'
import { requirePermissions } from '../../middleware/permissions'
import { sendData } from '../../services/utils/response'
import { PrismaService } from '../../services/prisma/prisma.service'

export const createReportsRouter = (reportsService: ReportsService, prisma: PrismaService) => {
  const router = Router()

  router.use(requireAuth(prisma))

  router.get(
    '/orders',
    requirePermissions('reports.read'),
    validateQuery(OrdersReportQueryDto),
    asyncHandler(async (req, res) => {
      const query = res.locals.query as OrdersReportQueryDto
      const result = await reportsService.orders(query)
      sendData(res, result)
    })
  )

  router.get(
    '/overdue',
    requirePermissions('reports.read'),
    validateQuery(OverdueReportQueryDto),
    asyncHandler(async (req, res) => {
      const query = res.locals.query as OverdueReportQueryDto
      const result = await reportsService.overdue(query)
      sendData(res, result)
    })
  )

  return router
}
