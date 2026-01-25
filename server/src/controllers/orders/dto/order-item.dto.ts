import { IsNumber, IsString, Min, MinLength } from 'class-validator'

export class OrderItemDto {
  @IsString()
  @MinLength(1)
  productId!: string

  @IsNumber()
  @Min(1)
  quantity!: number

  @IsNumber()
  @Min(0)
  price!: number
}
