import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { OrderStatus } from '../../../services/types/models'

export class OverdueReportQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  days?: number

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

  @IsOptional()
  @IsString()
  managerId?: string
}
