import { OrderStatus } from '../../../services/types/models'

export class OrdersReportRowDto {
  key!: string

  count!: number

  total!: number
}

export class OrdersReportResponseDto {
  groupBy!: 'status' | 'manager' | 'day'

  data!: OrdersReportRowDto[]
}

export class OverdueOrderRowDto {
  id!: string

  clientId!: string

  clientName?: string

  status!: OrderStatus

  total!: number

  managerId!: string

  createdAt!: string
}

export class OverdueReportResponseDto {
  data!: OverdueOrderRowDto[]

  total!: number

  days!: number
}
