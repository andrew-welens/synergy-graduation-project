import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '../../common/dto/pagination.dto'

export class InteractionsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  channel?: string

  @IsOptional()
  @IsDateString()
  dateFrom?: string

  @IsOptional()
  @IsDateString()
  dateTo?: string

  @IsOptional()
  @IsEnum(['createdAt', 'channel'])
  sortBy?: 'createdAt' | 'channel'

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDir?: 'asc' | 'desc'
}
