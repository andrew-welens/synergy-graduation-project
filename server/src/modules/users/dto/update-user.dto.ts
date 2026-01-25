import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { type Role } from '../../../types/models'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ example: 'Иванов Иван Иванович' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string

  @ApiPropertyOptional({ example: 'password123', minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string

  @ApiPropertyOptional({ enum: ['admin', 'manager', 'operator', 'analyst'], example: 'manager' })
  @IsOptional()
  @IsEnum(['admin', 'manager', 'operator', 'analyst'] as Role[])
  role?: Role
}
