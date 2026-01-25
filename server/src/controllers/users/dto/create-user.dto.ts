import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { type Role } from '../../../services/types/models'

export class CreateUserDto {
  @IsEmail()
  email!: string

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string

  @IsString()
  @MinLength(6)
  password!: string

  @IsEnum(['admin', 'manager', 'operator', 'analyst'] as Role[])
  role!: Role
}
