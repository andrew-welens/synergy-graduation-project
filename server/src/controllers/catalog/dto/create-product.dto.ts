import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name!: string

  @IsString()
  @MinLength(1)
  categoryId!: string

  @IsNumber()
  price!: number

  @IsEnum(['шт', 'усл.', 'мес.'])
  unit!: 'шт' | 'усл.' | 'мес.'

  @IsBoolean()
  isAvailable!: boolean

  @IsOptional()
  @IsString()
  sku?: string
}
