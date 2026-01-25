export class AuditLogResponseDto {
  id!: string

  userId!: string

  action!: string

  entityType!: string

  entityId?: string

  createdAt!: string

  metadata?: Record<string, unknown>
}

export class AuditListResponseDto {
  data!: AuditLogResponseDto[]

  total!: number
}
