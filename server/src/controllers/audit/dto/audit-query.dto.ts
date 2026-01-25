import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '../../common/dto/pagination.dto'

export class AuditQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  entityType?: string

  @IsOptional()
  @IsString()
  entityId?: string

  @IsOptional()
  @IsString()
  userId?: string

  @IsOptional()
  @IsDateString()
  dateFrom?: string

  @IsOptional()
  @IsDateString()
  dateTo?: string

  @IsOptional()
  @IsEnum(['createdAt', 'action'])
  sortBy?: 'createdAt' | 'action'

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDir?: 'asc' | 'desc'
}
