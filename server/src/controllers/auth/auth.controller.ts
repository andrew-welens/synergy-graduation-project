import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { AuthService } from '../../services/auth/auth.service'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'
import { asyncHandler } from '../../middleware/async-handler'
import { validateBody } from '../../middleware/validate'
import { sendData } from '../../services/utils/response'
import { PrismaService } from '../../services/prisma/prisma.service'

const accessCookie = {
  name: 'accessToken',
  options: { httpOnly: true, sameSite: 'lax' as const, secure: false, maxAge: 30 * 60 * 1000, path: '/' }
}

const refreshCookie = {
  name: 'refreshToken',
  options: { httpOnly: true, sameSite: 'lax' as const, secure: false, maxAge: 30 * 60 * 1000, path: '/' }
}

export const createAuthRouter = (authService: AuthService, prisma: PrismaService) => {
  const router = Router()
  const isTest = process.env.NODE_ENV === 'test' || process.env.CYPRESS === 'true'
  const noopMiddleware = (_req: unknown, _res: unknown, next: () => void) => next()
  
  if (isTest) {
    console.log('✓ Auth rate limiting DISABLED for tests')
  }
  
  const loginLimiter = isTest ? noopMiddleware : rateLimit({ 
    windowMs: 60 * 1000, 
    limit: 5 
  })
  const refreshLimiter = isTest ? noopMiddleware : rateLimit({ 
    windowMs: 60 * 1000, 
    limit: 100 
  })

  router.post(
    '/login',
    loginLimiter,
    validateBody(LoginDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as LoginDto
      const result = await authService.login(dto.email, dto.password)
      res.cookie(accessCookie.name, result.accessToken, accessCookie.options)
      res.cookie(refreshCookie.name, result.refreshToken, refreshCookie.options)
      sendData(res, result, 201)
    })
  )

  router.post(
    '/refresh',
    refreshLimiter,
    validateBody(RefreshDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as RefreshDto
      const refreshToken = req.cookies?.refreshToken ?? dto.refreshToken
      const result = await authService.refresh(refreshToken)
      res.cookie(accessCookie.name, result.accessToken, accessCookie.options)
      sendData(res, result)
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

  return router
}
