import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class InteractionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ format: 'uuid' })
  clientId!: string

  @ApiProperty({ example: 'Звонок' })
  channel!: string

  @ApiProperty({ example: 'Обсудили условия' })
  description!: string

  @ApiPropertyOptional({ format: 'uuid' })
  managerId?: string

  @ApiProperty({ format: 'date-time' })
  createdAt!: string
}

export class InteractionsListResponseDto {
  @ApiProperty({ type: [InteractionResponseDto] })
  data!: InteractionResponseDto[]

  @ApiProperty({ example: 0 })
  total!: number
}
