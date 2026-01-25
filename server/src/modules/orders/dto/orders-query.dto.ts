import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { OrderStatus } from '../../../types/models'
import { PaginationDto } from '../../../common/dto/pagination.dto'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class OrdersQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.New })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

  @ApiPropertyOptional({ format: 'uuid', example: 'client-id' })
  @IsOptional()
  @IsString()
  clientId?: string

  @ApiPropertyOptional({ format: 'uuid', example: 'manager-id' })
  @IsOptional()
  @IsString()
  managerId?: string

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string

  @ApiPropertyOptional({ enum: ['status', 'total', 'createdAt'], example: 'createdAt' })
  @IsOptional()
  @IsEnum(['status', 'total', 'createdAt'])
  sortBy?: 'status' | 'total' | 'createdAt'

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDir?: 'asc' | 'desc'
}
