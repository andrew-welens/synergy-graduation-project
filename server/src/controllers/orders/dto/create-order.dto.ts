import { IsArray, IsOptional, IsString, IsEnum, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { OrderStatus } from '../../../services/types/models'
import { OrderItemDto } from './order-item.dto'

export class CreateOrderDto {
  @IsString()
  clientId!: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[]

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

  @IsOptional()
  @IsString()
  managerId?: string

  @IsOptional()
  @IsString()
  comments?: string
}
