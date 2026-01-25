import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler } from '@nestjs/common'
import { map, type Observable } from 'rxjs'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<{ data: unknown }> {
    return next.handle().pipe(map((data) => ({ data })))
  }
}
