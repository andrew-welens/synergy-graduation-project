import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateProductDto {
  @ApiProperty({ example: 'Абонентская плата' })
  @IsString()
  @MinLength(1)
  name!: string

  @ApiProperty({ format: 'uuid', example: 'category-id' })
  @IsString()
  @MinLength(1)
  categoryId!: string

  @ApiProperty({ example: 1500, minimum: 0 })
  @IsNumber()
  price!: number

  @ApiProperty({ enum: ['шт', 'усл.', 'мес.'], example: 'шт' })
  @IsEnum(['шт', 'усл.', 'мес.'])
  unit!: 'шт' | 'усл.' | 'мес.'

  @ApiProperty({ example: true })
  @IsBoolean()
  isAvailable!: boolean

  @ApiPropertyOptional({ example: 'SKU-001' })
  @IsOptional()
  @IsString()
  sku?: string
}
