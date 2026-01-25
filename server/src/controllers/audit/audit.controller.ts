import { Router } from 'express'
import { AuditService } from '../../services/audit/audit.service'
import { AuditQueryDto } from './dto/audit-query.dto'
import { asyncHandler } from '../../middleware/async-handler'
import { validateQuery } from '../../middleware/validate'
import { requireAuth } from '../../middleware/auth'
import { requirePermissions } from '../../middleware/permissions'
import { sendData } from '../../services/utils/response'
import { PrismaService } from '../../services/prisma/prisma.service'

export const createAuditRouter = (auditService: AuditService, prisma: PrismaService) => {
  const router = Router()

  router.use(requireAuth(prisma))

  router.get(
    '/',
    requirePermissions('audit.read'),
    validateQuery(AuditQueryDto),
    asyncHandler(async (req, res) => {
      const query = res.locals.query as AuditQueryDto
      const result = await auditService.list(query)
      sendData(res, result)
    })
  )

  return router
}
