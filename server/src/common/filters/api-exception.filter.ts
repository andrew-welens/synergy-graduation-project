import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const payload = exception instanceof HttpException ? exception.getResponse() : null
    const message = this.resolveMessage(payload) ?? 'Ошибка запроса'
    const code = this.resolveCode(payload, status)
    response.status(status).json({ code, message })
  }

  private resolveMessage(payload: unknown) {
    if (!payload) return null
    if (typeof payload === 'string') return payload
    if (typeof payload === 'object' && payload !== null) {
      const obj = payload as { message?: string | string[] }
      if (Array.isArray(obj.message)) {
        return obj.message[0]
      }
      return obj.message ?? null
    }
    return null
  }

  private resolveCode(payload: unknown, status: number) {
    if (payload && typeof payload === 'object' && payload !== null) {
      const obj = payload as { code?: string }
      if (obj.code) return obj.code
    }
    if (status === HttpStatus.UNAUTHORIZED) return 'AUTH_REQUIRED'
    if (status === HttpStatus.FORBIDDEN) return 'FORBIDDEN'
    if (status === HttpStatus.NOT_FOUND) return 'NOT_FOUND'
    if (status === HttpStatus.BAD_REQUEST) return 'VALIDATION_ERROR'
    if (status === HttpStatus.CONFLICT) return 'STATUS_TRANSITION_FORBIDDEN'
    return 'INTERNAL_ERROR'
  }
}
