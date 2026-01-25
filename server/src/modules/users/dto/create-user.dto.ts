import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { type Role } from '../../../types/models'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string

  @ApiPropertyOptional({ example: 'Иванов Иван Иванович' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string

  @ApiProperty({ enum: ['admin', 'manager', 'operator', 'analyst'], example: 'manager' })
  @IsEnum(['admin', 'manager', 'operator', 'analyst'] as Role[])
  role!: Role
}
