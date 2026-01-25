import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ClientResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ example: 'ООО Ромашка' })
  name!: string

  @ApiPropertyOptional({ example: 'info@romashka.ru' })
  email?: string

  @ApiPropertyOptional({ example: '+79990000000' })
  phone?: string

  @ApiPropertyOptional({ example: 'Москва' })
  city?: string

  @ApiPropertyOptional({ example: 'Москва, ул. Пушкина, 1' })
  address?: string

  @ApiPropertyOptional({ example: 'manager-id' })
  managerId?: string

  @ApiProperty({ type: [String], example: ['vip'] })
  tags!: string[]

  @ApiProperty({ enum: ['legal', 'individual'], example: 'legal' })
  type!: 'legal' | 'individual'

  @ApiPropertyOptional({ example: '7700000000' })
  inn?: string

  @ApiProperty({ format: 'date-time' })
  createdAt!: string

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string

  @ApiPropertyOptional({ example: 2 })
  ordersCount?: number
}

export class ClientsListResponseDto {
  @ApiProperty({ type: [ClientResponseDto] })
  data!: ClientResponseDto[]

  @ApiProperty({ example: 0 })
  total!: number
}
