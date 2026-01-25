import { IsArray, IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength, ValidateIf } from 'class-validator'

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  @MinLength(5)
  phone?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  managerId?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @IsEnum(['legal', 'individual'])
  type?: 'legal' | 'individual'

  @ValidateIf((o) => o.type === 'legal')
  @Matches(/^\d{10}$/)
  inn?: string
}
