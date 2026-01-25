import { IsOptional, IsString, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCategoryDto {
  @ApiProperty({ example: 'Услуги' })
  @IsString()
  @MinLength(1)
  name!: string

  @ApiPropertyOptional({ example: 'Основные услуги' })
  @IsOptional()
  @IsString()
  description?: string
}
