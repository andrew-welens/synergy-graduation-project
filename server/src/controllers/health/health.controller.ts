import { Router, type Request, type Response } from 'express'
import type { PrismaService } from '../../services/prisma/prisma.service'
import { asyncHandler } from '../../middleware/async-handler'

export const createHealthRouter = (prisma: PrismaService) => {
  const router = Router()

  router.get(
    '/',
    asyncHandler(async (_req: Request, res: Response) => {
      let dbStatus = 'unknown'
      try {
        await prisma.$queryRaw`SELECT 1`
        dbStatus = 'connected'
      } catch {
        dbStatus = 'disconnected'
      }

      const health = {
        status: dbStatus === 'connected' ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus,
        environment: process.env.NODE_ENV ?? 'development'
      }

      const statusCode = health.status === 'ok' ? 200 : 503
      res.status(statusCode).json(health)
    })
  )

  return router
}