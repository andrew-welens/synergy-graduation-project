import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { type Role } from '../../../services/types/models'

export class CreateUserDto {
  @IsEmail()
  email!: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string

  @IsString()
  @MinLength(6)
  password!: string

  @IsEnum(['admin', 'manager', 'operator', 'analyst'] as Role[])
  role!: Role
}
