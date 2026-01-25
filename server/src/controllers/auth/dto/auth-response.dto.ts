import { type Role, type Permission } from '../../../services/types/models'

export class LoginResponseDto {
  accessToken!: string

  refreshToken!: string
}

export class RefreshResponseDto {
  accessToken!: string
}

export class LogoutResponseDto {
  ok!: boolean
}

export class MeResponseDto {
  id!: string

  email!: string

  role!: Role

  permissions!: Permission[]
}
