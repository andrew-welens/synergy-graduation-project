import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  categoryId?: string

  @IsOptional()
  @IsNumber()
  price?: number

  @IsOptional()
  @IsEnum(['шт', 'усл.', 'мес.'])
  unit?: 'шт' | 'усл.' | 'мес.'

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean

  @IsOptional()
  @IsString()
  sku?: string
}