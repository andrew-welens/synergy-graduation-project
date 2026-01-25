import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { OrderItemDto } from './order-item.dto'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateOrderDto {
  @ApiPropertyOptional({ type: [OrderItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[]

  @ApiPropertyOptional({ format: 'uuid', example: 'manager-id' })
  @IsOptional()
  @IsString()
  managerId?: string

  @ApiPropertyOptional({ example: 'Комментарий' })
  @IsOptional()
  @IsString()
  comments?: string
}
