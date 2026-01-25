import { type Role } from '../../../services/types/models'

export class UserResponseDto {
  id!: string

  email!: string

  firstName?: string

  lastName?: string

  isActive!: boolean

  role!: Role

  createdAt!: string
}

export class UsersListResponseDto {
  data!: UserResponseDto[]
}
