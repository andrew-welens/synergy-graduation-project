import { IsEnum } from 'class-validator'
import { OrderStatus } from '../../../services/types/models'

export class UpdateStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus
}
