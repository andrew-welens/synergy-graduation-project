import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { OrderStatus } from '../../../types/models'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class OrdersReportQueryDto {
  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string

  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.New })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

  @ApiPropertyOptional({ format: 'uuid', example: 'manager-id' })
  @IsOptional()
  @IsString()
  managerId?: string

  @ApiPropertyOptional({ enum: ['status', 'manager', 'day'], example: 'status' })
  @IsOptional()
  @IsEnum(['status', 'manager', 'day'])
  groupBy?: 'status' | 'manager' | 'day'
}
