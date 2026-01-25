import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { type Role } from '../../../types/models'

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ example: 'user@example.com' })
  email!: string

  @ApiPropertyOptional({ example: 'Иванов Иван Иванович' })
  name?: string

  @ApiProperty({ enum: ['admin', 'manager', 'operator', 'analyst'], example: 'manager' })
  role!: Role

  @ApiProperty({ format: 'date-time' })
  createdAt!: string
}

export class UsersListResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data!: UserResponseDto[]
}
