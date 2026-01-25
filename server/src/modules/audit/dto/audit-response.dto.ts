import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class AuditLogResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ format: 'uuid' })
  actorId!: string

  @ApiProperty({ example: 'order.created' })
  action!: string

  @ApiProperty({ example: 'order' })
  entityType!: string

  @ApiPropertyOptional({ example: 'entity-id' })
  entityId?: string

  @ApiProperty({ format: 'date-time' })
  createdAt!: string

  @ApiPropertyOptional({ type: Object })
  metadata?: Record<string, unknown>
}

export class AuditListResponseDto {
  @ApiProperty({ type: [AuditLogResponseDto] })
  data!: AuditLogResponseDto[]

  @ApiProperty({ example: 0 })
  total!: number
}
