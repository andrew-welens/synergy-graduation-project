import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { OrderStatus } from '../../../types/models'

export class OrderItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  productId!: string

  @ApiProperty({ example: 2 })
  quantity!: number

  @ApiProperty({ example: 1500 })
  price!: number
}

export class OrderStatusHistoryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.New })
  status!: OrderStatus

  @ApiPropertyOptional({ format: 'uuid' })
  actorId?: string

  @ApiProperty({ format: 'date-time' })
  createdAt!: string
}

export class OrderResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ format: 'uuid' })
  clientId!: string

  @ApiPropertyOptional({ example: 'Иванов Иван Иванович' })
  clientName?: string

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.New })
  status!: OrderStatus

  @ApiProperty({ example: 3000 })
  total!: number

  @ApiPropertyOptional({ example: 3000 })
  totalAmount?: number

  @ApiPropertyOptional({ example: 'Срочно' })
  comments?: string

  @ApiPropertyOptional({ format: 'uuid' })
  managerId?: string

  @ApiPropertyOptional({ example: 'Иванов Иван Иванович' })
  managerName?: string

  @ApiPropertyOptional({ example: 'manager1@example.com' })
  managerEmail?: string

  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[]

  @ApiPropertyOptional({ type: [OrderStatusHistoryResponseDto] })
  history?: OrderStatusHistoryResponseDto[]

  @ApiProperty({ format: 'date-time' })
  createdAt!: string

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string

  @ApiPropertyOptional({ format: 'date-time' })
  completedAt?: string
}

export class OrdersListResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data!: OrderResponseDto[]

  @ApiProperty({ example: 0 })
  total!: number
}
