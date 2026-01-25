import { type Role } from '../../../services/types/models'

export class UserResponseDto {
  id!: string

  email!: string

  name?: string

  role!: Role

  createdAt!: string
}

export class UsersListResponseDto {
  data!: UserResponseDto[]
}
