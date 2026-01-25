import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { type Permission } from '../../types/models'

export interface RequestUser {
  id: string
  email: string
  role: string
  permissions: Permission[]
}

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.user as RequestUser | undefined
})
