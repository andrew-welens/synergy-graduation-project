import { ApiProperty } from '@nestjs/swagger'
import { OrderStatus } from '../../../types/models'

export class OrdersReportRowDto {
  @ApiProperty({ example: 'new' })
  key!: string

  @ApiProperty({ example: 10 })
  count!: number

  @ApiProperty({ example: 15000 })
  total!: number
}

export class OrdersReportResponseDto {
  @ApiProperty({ enum: ['status', 'manager', 'day'], example: 'status' })
  groupBy!: 'status' | 'manager' | 'day'

  @ApiProperty({ type: [OrdersReportRowDto] })
  data!: OrdersReportRowDto[]
}

export class OverdueOrderRowDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ format: 'uuid' })
  clientId!: string

  @ApiProperty({ example: 'Иванов Иван Иванович' })
  clientName?: string

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.InProgress })
  status!: OrderStatus

  @ApiProperty({ example: 1500 })
  total!: number

  @ApiProperty({ format: 'uuid' })
  managerId!: string

  @ApiProperty({ format: 'date-time' })
  createdAt!: string
}

export class OverdueReportResponseDto {
  @ApiProperty({ type: [OverdueOrderRowDto] })
  data!: OverdueOrderRowDto[]

  @ApiProperty({ example: 0 })
  total!: number

  @ApiProperty({ example: 7 })
  days!: number
}
