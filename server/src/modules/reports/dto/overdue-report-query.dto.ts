import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { PaginationDto } from '../../../common/dto/pagination.dto'
import { OrderStatus } from '../../../types/models'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class OverdueReportQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 7, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  days?: number

  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.InProgress })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

  @ApiPropertyOptional({ format: 'uuid', example: 'manager-id' })
  @IsOptional()
  @IsString()
  managerId?: string
}
