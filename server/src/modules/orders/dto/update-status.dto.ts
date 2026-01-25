import { IsEnum } from 'class-validator'
import { OrderStatus } from '../../../types/models'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.InProgress })
  @IsEnum(OrderStatus)
  status!: OrderStatus
}
