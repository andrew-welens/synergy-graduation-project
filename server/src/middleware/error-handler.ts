import type { NextFunction, Request, Response } from 'express'
import { ApiError, type ApiErrorCode } from '../services/common/errors/api-error'
import { ValidationError } from 'class-validator'
import { Prisma } from '@prisma/client'

const defaultCodeByStatus = (status: number): ApiErrorCode => {
  if (status === 401) return 'AUTH_REQUIRED'
  if (status === 403) return 'FORBIDDEN'
  if (status === 404) return 'NOT_FOUND'
  if (status === 400) return 'VALIDATION_ERROR'
  if (status === 409) return 'STATUS_TRANSITION_FORBIDDEN'
  return 'INTERNAL_ERROR'
}

const resolveValidationMessage = (errors: ValidationError[]) => {
  const findConstraint = (items: ValidationError[]): string | null => {
    for (const item of items) {
      if (item.constraints) {
        const message = Object.values(item.constraints)[0]
        if (message) return message
      }
      if (item.children && item.children.length > 0) {
        const nested = findConstraint(item.children as ValidationError[])
        if (nested) return nested
      }
    }
    return null
  }
  return findConstraint(errors) ?? 'Ошибка запроса'
}

const isValidationErrors = (value: unknown): value is ValidationError[] => {
  return Array.isArray(value) && value.every((item) => item && typeof item === 'object' && ('constraints' in item || 'children' in item))
}

const isPrismaError = (error: unknown): error is Prisma.PrismaClientKnownRequestError => {
  return error instanceof Error && 'code' in error && typeof (error as { code: string }).code === 'string'
}

const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): { status: number, code: ApiErrorCode, message: string } => {
  switch (error.code) {
    case 'P2002':
      return { status: 409, code: 'VALIDATION_ERROR', message: 'Запись с такими данными уже существует' }
    case 'P2025':
      return { status: 404, code: 'NOT_FOUND', message: 'Запись не найдена' }
    case 'P2003':
      return { status: 400, code: 'VALIDATION_ERROR', message: 'Нарушение ограничения внешнего ключа' }
    default:
      return { status: 500, code: 'INTERNAL_ERROR', message: 'Ошибка базы данных' }
  }
}

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (isValidationErrors(err)) {
    const message = resolveValidationMessage(err)
    return res.status(400).json({ code: 'VALIDATION_ERROR', message })
  }
  if (err instanceof ApiError) {
    return res.status(err.status).json({ code: err.code, message: err.message })
  }
  if (isPrismaError(err)) {
    const { status, code, message } = handlePrismaError(err)
    return res.status(status).json({ code, message })
  }
  if (err instanceof Error) {
    const status = 500
    const isProduction = process.env.NODE_ENV === 'production'
    const errorLog = {
      message: err.message,
      stack: isProduction ? undefined : err.stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    }
    console.error('Internal server error:', isProduction ? JSON.stringify(errorLog) : errorLog)
    return res.status(status).json({ code: defaultCodeByStatus(status), message: isProduction ? 'Внутренняя ошибка сервера' : err.message || 'Ошибка запроса' })
  }
  const unknownError = {
    error: String(err),
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  }
  console.error('Unknown error:', process.env.NODE_ENV === 'production' ? JSON.stringify(unknownError) : unknownError)
  return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Ошибка запроса' })
}
