import { IsEnum, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import { PaginationDto } from '../../common/dto/pagination.dto'

export class ClientsQueryDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : value === 'true'))
  hasOrders?: boolean

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsEnum(['legal', 'individual'])
  type?: 'legal' | 'individual'

  @IsOptional()
  @IsEnum(['name', 'email', 'ordersCount', 'createdAt'])
  sortBy?: 'name' | 'email' | 'ordersCount' | 'createdAt'

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDir?: 'asc' | 'desc'
}
