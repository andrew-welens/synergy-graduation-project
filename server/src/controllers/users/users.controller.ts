import { Router } from 'express'
import { UsersService } from '../../services/users/users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { validateBody } from '../../middleware/validate'
import { asyncHandler } from '../../middleware/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requirePermissions } from '../../middleware/permissions'
import { sendData } from '../../services/utils/response'
import { PrismaService } from '../../services/prisma/prisma.service'

export const createUsersRouter = (usersService: UsersService, prisma: PrismaService) => {
  const router = Router()

  router.use(requireAuth(prisma))

  router.get(
    '/',
    requirePermissions('users.manage'),
    asyncHandler(async (_req, res) => {
      const result = await usersService.list()
      sendData(res, result)
    })
  )

  router.get(
    '/:id',
    requirePermissions('users.manage'),
    asyncHandler(async (req, res) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const result = await usersService.findOne(id)
      sendData(res, result)
    })
  )

  router.post(
    '/',
    requirePermissions('users.manage'),
    validateBody(CreateUserDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as CreateUserDto
      const result = await usersService.create(req.user?.id ?? 'unknown', dto)
      sendData(res, result, 201)
    })
  )

  router.put(
    '/:id',
    requirePermissions('users.manage'),
    validateBody(UpdateUserDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as UpdateUserDto
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const result = await usersService.update(req.user?.id ?? 'unknown', id, dto)
      sendData(res, result)
    })
  )

  router.delete(
    '/:id',
    requirePermissions('users.manage'),
    asyncHandler(async (req, res) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const result = await usersService.remove(req.user?.id ?? 'unknown', id)
      sendData(res, result)
    })
  )

  return router
}
