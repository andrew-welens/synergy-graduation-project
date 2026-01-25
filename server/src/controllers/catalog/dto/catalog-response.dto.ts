export class CategoryResponseDto {
  id!: string

  name!: string

  description?: string

  createdAt!: string

  updatedAt!: string
}

export class ProductResponseDto {
  id!: string

  name!: string

  categoryId!: string

  price!: number

  unit!: string

  isAvailable!: boolean

  sku?: string

  createdAt!: string

  updatedAt!: string
}

export class CategoriesListResponseDto {
  data!: CategoryResponseDto[]

  total!: number
}

export class ProductsListResponseDto {
  data!: ProductResponseDto[]

  total!: number
}
