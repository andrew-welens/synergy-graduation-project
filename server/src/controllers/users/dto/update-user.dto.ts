import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { type Role } from '../../../services/types/models'

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string

  @IsOptional()
  @IsEnum(['admin', 'manager', 'operator', 'analyst'] as Role[])
  role?: Role
}
