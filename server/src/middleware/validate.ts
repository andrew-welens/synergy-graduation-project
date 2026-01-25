import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'

const validateInstance = async (instance: object) => {
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true
  })
  if (errors.length > 0) {
    throw errors
  }
}

const toInstance = <T>(cls: new () => T, value: unknown): T => {
  return plainToInstance(cls, value, { enableImplicitConversion: true })
}

export const validateBody = <T>(cls: new () => T): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const instance = toInstance(cls, req.body)
      await validateInstance(instance as object)
      req.body = instance
      next()
    } catch (error) {
      next(error)
    }
  }
}

export const validateQuery = <T>(cls: new () => T): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instance = toInstance(cls, req.query)
      await validateInstance(instance as object)
      res.locals.query = instance
      next()
    } catch (error) {
      next(error)
    }
  }
}

export const validateParams = <T>(cls: new () => T): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const instance = toInstance(cls, req.params)
      await validateInstance(instance as object)
      req.params = instance as Request['params']
      next()
    } catch (error) {
      next(error)
    }
  }
}
