import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CategoryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ example: 'Услуги' })
  name!: string

  @ApiPropertyOptional({ example: 'Основные услуги' })
  description?: string

  @ApiProperty({ format: 'date-time' })
  createdAt!: string

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string
}

export class ProductResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ example: 'Абонентская плата' })
  name!: string

  @ApiProperty({ format: 'uuid' })
  categoryId!: string

  @ApiProperty({ example: 1500 })
  price!: number

  @ApiProperty({ example: 'шт' })
  unit!: string

  @ApiProperty({ example: true })
  isAvailable!: boolean

  @ApiPropertyOptional({ example: 'SKU-001' })
  sku?: string

  @ApiProperty({ format: 'date-time' })
  createdAt!: string

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string
}

export class CategoriesListResponseDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  data!: CategoryResponseDto[]

  @ApiProperty({ example: 0 })
  total!: number
}

export class ProductsListResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  data!: ProductResponseDto[]

  @ApiProperty({ example: 0 })
  total!: number
}
