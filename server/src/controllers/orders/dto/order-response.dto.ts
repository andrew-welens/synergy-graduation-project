import { OrderStatus } from '../../../services/types/models'

export class OrderItemResponseDto {
  productId!: string

  quantity!: number

  price!: number
}

export class OrderStatusHistoryResponseDto {
  id!: string

  status!: OrderStatus

  actorId?: string

  createdAt!: string
}

export class OrderResponseDto {
  id!: string

  clientId!: string

  clientName?: string

  status!: OrderStatus

  total!: number

  totalAmount?: number

  comments?: string

  managerId?: string

  managerName?: string

  managerEmail?: string

  items!: OrderItemResponseDto[]

  history?: OrderStatusHistoryResponseDto[]

  createdAt!: string

  updatedAt!: string

  completedAt?: string
}

export class OrdersListResponseDto {
  data!: OrderResponseDto[]

  total!: number
}
