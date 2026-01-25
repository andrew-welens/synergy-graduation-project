import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { AuthService } from '../../services/auth/auth.service'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'
import { asyncHandler } from '../../middleware/async-handler'
import { validateBody } from '../../middleware/validate'
import { requireAuth } from '../../middleware/auth'
import { sendData } from '../../services/utils/response'
import { PrismaService } from '../../services/prisma/prisma.service'

const accessCookie = {
  name: 'accessToken',
  options: { httpOnly: true, sameSite: 'lax' as const, secure: false, maxAge: 30 * 60 * 1000, path: '/' }
}

const refreshCookie = {
  name: 'refreshToken',
  options: { httpOnly: true, sameSite: 'lax' as const, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' }
}

export const createAuthRouter = (authService: AuthService, prisma: PrismaService) => {
  const router = Router()
  const loginLimiter = rateLimit({ windowMs: 60 * 1000, limit: 5 })

  router.post(
    '/login',
    loginLimiter,
    validateBody(LoginDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as LoginDto
      const tokens = await authService.login(dto.email, dto.password)
      res.cookie(accessCookie.name, tokens.accessToken, accessCookie.options)
      res.cookie(refreshCookie.name, tokens.refreshToken, refreshCookie.options)
      sendData(res, tokens, 201)
    })
  )

  router.post(
    '/refresh',
    validateBody(RefreshDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as RefreshDto
      const refreshToken = req.cookies?.refreshToken ?? dto.refreshToken
      const { accessToken } = await authService.refresh(refreshToken)
      res.cookie(accessCookie.name, accessToken, accessCookie.options)
      sendData(res, { accessToken })
    })
  )

  router.post(
    '/logout',
    asyncHandler(async (_req, res) => {
      res.clearCookie(accessCookie.name, accessCookie.options)
      res.clearCookie(refreshCookie.name, refreshCookie.options)
      sendData(res, { ok: true })
    })
  )

  router.get(
    '/me',
    requireAuth(prisma),
    asyncHandler(async (req, res) => {
      const user = req.user
      sendData(res, { id: user?.id, email: user?.email, role: user?.role, permissions: user?.permissions })
    })
  )

  return router
}
