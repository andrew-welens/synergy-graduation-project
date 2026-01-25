import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { OrderItemDto } from './order-item.dto'

export class UpdateOrderDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[]

  @IsOptional()
  @IsString()
  managerId?: string

  @IsOptional()
  @IsString()
  comments?: string
}
