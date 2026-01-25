import type { NextFunction, Request, Response } from 'express'
import { ApiError, type ApiErrorCode } from '../services/common/errors/api-error'
import { ValidationError } from 'class-validator'

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

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (isValidationErrors(err)) {
    const message = resolveValidationMessage(err)
    return res.status(400).json({ code: 'VALIDATION_ERROR', message })
  }
  if (err instanceof ApiError) {
    return res.status(err.status).json({ code: err.code, message: err.message })
  }
  if (err instanceof Error) {
    const status = 500
    return res.status(status).json({ code: defaultCodeByStatus(status), message: err.message || 'Ошибка запроса' })
  }
  return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Ошибка запроса' })
}
