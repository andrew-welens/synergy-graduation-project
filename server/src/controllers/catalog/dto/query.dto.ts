import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import { PaginationDto } from '../../common/dto/pagination.dto'

export class CatalogQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsEnum(['name', 'createdAt'])
  sortBy?: 'name' | 'createdAt'

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDir?: 'asc' | 'desc'
}

export class ProductsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  categoryId?: string

  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : value === 'true'))
  @IsBoolean()
  isAvailable?: boolean

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsEnum(['name', 'price', 'createdAt'])
  sortBy?: 'name' | 'price' | 'createdAt'

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDir?: 'asc' | 'desc'
}
