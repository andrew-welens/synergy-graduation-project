import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import { PaginationDto } from '../../../common/dto/pagination.dto'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class CatalogQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'услуги' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: ['name', 'createdAt'], example: 'name' })
  @IsOptional()
  @IsEnum(['name', 'createdAt'])
  sortBy?: 'name' | 'createdAt'

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDir?: 'asc' | 'desc'
}

export class ProductsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ format: 'uuid', example: 'category-id' })
  @IsOptional()
  @IsString()
  categoryId?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isAvailable?: boolean

  @ApiPropertyOptional({ example: 'тариф' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: ['name', 'price', 'createdAt'], example: 'name' })
  @IsOptional()
  @IsEnum(['name', 'price', 'createdAt'])
  sortBy?: 'name' | 'price' | 'createdAt'

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDir?: 'asc' | 'desc'
}
