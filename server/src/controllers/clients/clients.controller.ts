import { Router } from 'express'
import { ClientsService } from '../../services/clients/clients.service'
import { CreateClientDto } from './dto/create-client.dto'
import { UpdateClientDto } from './dto/update-client.dto'
import { ClientsQueryDto } from './dto/clients-query.dto'
import { asyncHandler } from '../../middleware/async-handler'
import { validateBody, validateQuery } from '../../middleware/validate'
import { requireAuth } from '../../middleware/auth'
import { requirePermissions } from '../../middleware/permissions'
import { sendData } from '../../services/utils/response'
import { PrismaService } from '../../services/prisma/prisma.service'

export const createClientsRouter = (clientsService: ClientsService, prisma: PrismaService) => {
  const router = Router()

  router.use(requireAuth(prisma))

  router.get(
    '/',
    requirePermissions('clients.read'),
    validateQuery(ClientsQueryDto),
    asyncHandler(async (req, res) => {
      const query = res.locals.query as ClientsQueryDto
      const page = query.page ?? 1
      const pageSize = query.pageSize ?? 20
      const result = await clientsService.findAll(page, pageSize, query.hasOrders, query.search, query.type, query.sortBy, query.sortDir)
      sendData(res, result)
    })
  )

  router.get(
    '/:id',
    requirePermissions('clients.read'),
    asyncHandler(async (req, res) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const result = await clientsService.findOne(id)
      sendData(res, result)
    })
  )

  router.post(
    '/',
    requirePermissions('clients.write'),
    validateBody(CreateClientDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as CreateClientDto
      const result = await clientsService.create(req.user?.id ?? 'unknown', dto)
      sendData(res, result, 201)
    })
  )

  router.put(
    '/:id',
    requirePermissions('clients.write'),
    validateBody(UpdateClientDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as UpdateClientDto
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const result = await clientsService.update(req.user?.id ?? 'unknown', id, dto)
      sendData(res, result)
    })
  )

  router.delete(
    '/:id',
    requirePermissions('clients.delete'),
    asyncHandler(async (req, res) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const result = await clientsService.remove(req.user?.id ?? 'unknown', id)
      sendData(res, result)
    })
  )

  return router
}
