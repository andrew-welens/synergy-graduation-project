import { Router } from 'express'
import { InteractionsService } from '../../services/interactions/interactions.service'
import { CreateInteractionDto } from './dto/create-interaction.dto'
import { InteractionsQueryDto } from './dto/interactions-query.dto'
import { UpdateInteractionDto } from './dto/update-interaction.dto'
import { asyncHandler } from '../../middleware/async-handler'
import { validateBody, validateQuery } from '../../middleware/validate'
import { requireAuth } from '../../middleware/auth'
import { requirePermissions } from '../../middleware/permissions'
import { sendData } from '../../services/utils/response'
import { PrismaService } from '../../services/prisma/prisma.service'

export const createInteractionsRouter = (interactionsService: InteractionsService, prisma: PrismaService) => {
  const router = Router({ mergeParams: true })

  router.use(requireAuth(prisma))

  router.get(
    '/',
    requirePermissions('interactions.read'),
    validateQuery(InteractionsQueryDto),
    asyncHandler(async (req, res) => {
      const query = res.locals.query as InteractionsQueryDto
      const clientId = Array.isArray(req.params.clientId) ? req.params.clientId[0] : req.params.clientId
      const result = await interactionsService.list(clientId, query)
      sendData(res, result)
    })
  )

  router.post(
    '/',
    requirePermissions('interactions.write'),
    validateBody(CreateInteractionDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as CreateInteractionDto
      const clientId = Array.isArray(req.params.clientId) ? req.params.clientId[0] : req.params.clientId
      const result = await interactionsService.create(req.user?.id ?? 'unknown', clientId, dto)
      sendData(res, result, 201)
    })
  )

  router.put(
    '/:id',
    requirePermissions('interactions.write'),
    validateBody(UpdateInteractionDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as UpdateInteractionDto
      const clientId = Array.isArray(req.params.clientId) ? req.params.clientId[0] : req.params.clientId
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const result = await interactionsService.update(req.user?.id ?? 'unknown', clientId, id, dto)
      sendData(res, result)
    })
  )

  router.delete(
    '/:id',
    requirePermissions('interactions.write'),
    asyncHandler(async (req, res) => {
      const clientId = Array.isArray(req.params.clientId) ? req.params.clientId[0] : req.params.clientId
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const result = await interactionsService.remove(req.user?.id ?? 'unknown', clientId, id)
      sendData(res, result)
    })
  )

  return router
}
