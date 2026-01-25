import express from 'express'
import cookieParser from 'cookie-parser'
import { errorHandler } from '../../src/middleware/error-handler'
import { signAccessToken } from '../../src/services/utils/jwt'
import type { Router } from 'express'
import type { RequestUser } from '../../src/services/types/request-user'

export const createTestApp = (routes: Array<{ path: string, router: Router }>, user?: RequestUser) => {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret'

  const app = express()
  app.use(express.json())
  app.use(cookieParser())

  routes.forEach((route) => app.use(route.path, route.router))

  app.use(errorHandler)

  const token = user
    ? signAccessToken({ userId: user.id, email: user.email, role: user.role })
    : null

  return { app, token }
}
