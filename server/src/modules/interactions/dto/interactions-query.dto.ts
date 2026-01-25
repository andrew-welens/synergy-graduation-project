import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '../../../common/dto/pagination.dto'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class InteractionsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'Звонок' })
  @IsOptional()
  @IsString()
  channel?: string

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string

  @ApiPropertyOptional({ enum: ['createdAt', 'channel'], example: 'createdAt' })
  @IsOptional()
  @IsEnum(['createdAt', 'channel'])
  sortBy?: 'createdAt' | 'channel'

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDir?: 'asc' | 'desc'
}
