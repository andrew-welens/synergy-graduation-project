import type { Permission, Role } from './models'

export interface RequestUser {
  id: string
  email: string
  role: Role
  permissions: Permission[]
}
