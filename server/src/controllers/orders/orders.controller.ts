import { Router } from 'express'
import { OrdersService } from '../../services/orders/orders.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateStatusDto } from './dto/update-status.dto'
import { OrdersQueryDto } from './dto/orders-query.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { asyncHandler } from '../../middleware/async-handler'
import { validateBody, validateQuery } from '../../middleware/validate'
import { requireAuth } from '../../middleware/auth'
import { requirePermissions } from '../../middleware/permissions'
import { sendData } from '../../services/utils/response'
import { PrismaService } from '../../services/prisma/prisma.service'

export const createOrdersRouter = (ordersService: OrdersService, prisma: PrismaService) => {
  const router = Router()

  router.use(requireAuth(prisma))

  router.get(
    '/',
    requirePermissions('orders.read'),
    validateQuery(OrdersQueryDto),
    asyncHandler(async (req, res) => {
      const query = res.locals.query as OrdersQueryDto
      const result = await ordersService.findAll(query)
      sendData(res, result)
    })
  )

  router.get(
    '/:id',
    requirePermissions('orders.read'),
    asyncHandler(async (req, res) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const result = await ordersService.findOne(id)
      sendData(res, result)
    })
  )

  router.post(
    '/',
    requirePermissions('orders.write'),
    validateBody(CreateOrderDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as CreateOrderDto
      const result = await ordersService.create(req.user?.id ?? 'unknown', dto)
      sendData(res, result, 201)
    })
  )

  router.post(
    '/:id/status',
    requirePermissions('orders.status.change'),
    validateBody(UpdateStatusDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as UpdateStatusDto
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const result = await ordersService.updateStatus(req.user?.id ?? 'unknown', req.user?.role ?? 'unknown', id, dto)
      sendData(res, result, 201)
    })
  )

  router.put(
    '/:id',
    requirePermissions('orders.write'),
    validateBody(UpdateOrderDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as UpdateOrderDto
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const result = await ordersService.update(req.user?.id ?? 'unknown', req.user?.role ?? 'unknown', id, dto)
      sendData(res, result)
    })
  )

  return router
}
