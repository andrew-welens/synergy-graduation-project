import { IsOptional, IsString, MinLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Услуги' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string

  @ApiPropertyOptional({ example: 'Обновленное описание' })
  @IsOptional()
  @IsString()
  description?: string
}
