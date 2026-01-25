import { IsArray, IsOptional, IsString, IsEnum, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { OrderStatus } from '../../../types/models'
import { OrderItemDto } from './order-item.dto'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateOrderDto {
  @ApiProperty({ format: 'uuid', example: 'client-id' })
  @IsString()
  clientId!: string

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[]

  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.New })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

  @ApiPropertyOptional({ format: 'uuid', example: 'manager-id' })
  @IsOptional()
  @IsString()
  managerId?: string

  @ApiPropertyOptional({ example: 'Срочно' })
  @IsOptional()
  @IsString()
  comments?: string
}
