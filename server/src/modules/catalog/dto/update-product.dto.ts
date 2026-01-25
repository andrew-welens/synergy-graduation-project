import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Абонентская плата' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string

  @ApiPropertyOptional({ format: 'uuid', example: 'category-id' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  categoryId?: string

  @ApiPropertyOptional({ example: 1500, minimum: 0 })
  @IsOptional()
  @IsNumber()
  price?: number

  @ApiPropertyOptional({ enum: ['шт', 'усл.', 'мес.'], example: 'шт' })
  @IsOptional()
  @IsEnum(['шт', 'усл.', 'мес.'])
  unit?: 'шт' | 'усл.' | 'мес.'

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean

  @ApiPropertyOptional({ example: 'SKU-001' })
  @IsOptional()
  @IsString()
  sku?: string
}
