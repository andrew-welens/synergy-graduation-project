import { ApiProperty } from '@nestjs/swagger'
import { type Role, type Permission } from '../../../types/models'

export class LoginResponseDto {
  @ApiProperty()
  accessToken!: string

  @ApiProperty()
  refreshToken!: string
}

export class RefreshResponseDto {
  @ApiProperty()
  accessToken!: string
}

export class LogoutResponseDto {
  @ApiProperty({ example: true })
  ok!: boolean
}

export class MeResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ example: 'user@example.com' })
  email!: string

  @ApiProperty({ enum: ['admin', 'manager', 'operator', 'analyst'], example: 'manager' })
  role!: Role

  @ApiProperty({ type: [String], example: ['clients.read'] })
  permissions!: Permission[]
}
