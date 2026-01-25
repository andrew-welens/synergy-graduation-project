import jwt from 'jsonwebtoken'
import type { Role } from '../types/models'

export interface JwtPayload {
  userId: string
  email: string
  role: Role
}

const accessSecret = () => process.env.JWT_SECRET ?? 'dev-secret'
const refreshSecret = () => process.env.JWT_REFRESH_SECRET ?? 'dev-refresh'

export const signAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, accessSecret(), { expiresIn: '30m' })
}

export const signRefreshToken = (payload: JwtPayload) => {
  return jwt.sign(payload, refreshSecret(), { expiresIn: '7d' })
}

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, accessSecret()) as JwtPayload
}

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, refreshSecret()) as JwtPayload
}
