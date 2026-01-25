import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { OrderStatus } from '../../../services/types/models'

export class OrdersReportQueryDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string

  @IsOptional()
  @IsDateString()
  dateTo?: string

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

  @IsOptional()
  @IsString()
  managerId?: string

  @IsOptional()
  @IsEnum(['status', 'manager', 'day'])
  groupBy?: 'status' | 'manager' | 'day'
}
