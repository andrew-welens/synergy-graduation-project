import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { OrderStatus } from '../../../services/types/models'
import { PaginationDto } from '../../common/dto/pagination.dto'

export class OrdersQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

  @IsOptional()
  @IsString()
  clientId?: string

  @IsOptional()
  @IsString()
  managerId?: string

  @IsOptional()
  @IsDateString()
  dateFrom?: string

  @IsOptional()
  @IsDateString()
  dateTo?: string

  @IsOptional()
  @IsEnum(['status', 'total', 'createdAt'])
  sortBy?: 'status' | 'total' | 'createdAt'

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDir?: 'asc' | 'desc'
}
