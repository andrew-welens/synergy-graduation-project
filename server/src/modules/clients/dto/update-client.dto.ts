import { IsArray, IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength, ValidateIf } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateClientDto {
  @ApiPropertyOptional({ example: 'ООО Ромашка' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string

  @ApiPropertyOptional({ example: 'info@romashka.ru' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ example: '+79990000000', minLength: 5 })
  @IsOptional()
  @IsString()
  @MinLength(5)
  phone?: string

  @ApiPropertyOptional({ example: 'Москва' })
  @IsOptional()
  @IsString()
  city?: string

  @ApiPropertyOptional({ example: 'Москва, ул. Пушкина, 1' })
  @IsOptional()
  @IsString()
  address?: string

  @ApiPropertyOptional({ format: 'uuid', example: 'manager-id' })
  @IsOptional()
  @IsString()
  managerId?: string

  @ApiPropertyOptional({ example: ['vip', 'retail'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional({ enum: ['legal', 'individual'], example: 'legal' })
  @IsOptional()
  @IsEnum(['legal', 'individual'])
  type?: 'legal' | 'individual'

  @ApiPropertyOptional({ example: '7700000000', pattern: '^\\d{10}$' })
  @ValidateIf((o) => o.type === 'legal')
  @Matches(/^\d{10}$/)
  inn?: string
}
