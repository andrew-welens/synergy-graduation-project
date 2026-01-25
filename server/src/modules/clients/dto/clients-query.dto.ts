import { IsEnum, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import { PaginationDto } from '../../../common/dto/pagination.dto'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class ClientsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  hasOrders?: boolean

  @ApiPropertyOptional({ example: 'ромашка' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: ['legal', 'individual'], example: 'legal' })
  @IsOptional()
  @IsEnum(['legal', 'individual'])
  type?: 'legal' | 'individual'

  @ApiPropertyOptional({ enum: ['name', 'email', 'ordersCount', 'createdAt'], example: 'name' })
  @IsOptional()
  @IsEnum(['name', 'email', 'ordersCount', 'createdAt'])
  sortBy?: 'name' | 'email' | 'ordersCount' | 'createdAt'

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDir?: 'asc' | 'desc'
}
