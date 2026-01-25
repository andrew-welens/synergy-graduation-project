import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '../../../common/dto/pagination.dto'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class AuditQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'order' })
  @IsOptional()
  @IsString()
  entityType?: string

  @ApiPropertyOptional({ format: 'uuid', example: 'entity-id' })
  @IsOptional()
  @IsString()
  entityId?: string

  @ApiPropertyOptional({ format: 'uuid', example: 'user-id' })
  @IsOptional()
  @IsString()
  userId?: string

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string

  @ApiPropertyOptional({ enum: ['createdAt', 'action'], example: 'createdAt' })
  @IsOptional()
  @IsEnum(['createdAt', 'action'])
  sortBy?: 'createdAt' | 'action'

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDir?: 'asc' | 'desc'
}
