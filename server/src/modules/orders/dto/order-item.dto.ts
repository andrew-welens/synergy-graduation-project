import { IsNumber, IsString, Min, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class OrderItemDto {
  @ApiProperty({ format: 'uuid', example: 'product-id' })
  @IsString()
  @MinLength(1)
  productId!: string

  @ApiProperty({ example: 2, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity!: number

  @ApiProperty({ example: 1500, minimum: 0 })
  @IsNumber()
  @Min(0)
  price!: number
}
