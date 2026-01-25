import { http } from './http'
import { type Paginated } from './types'

export interface AuditEntry {
  id: string
  actorId: string
  action: string
  entityType: string
  entityId?: string
  createdAt: string
  metadata?: Record<string, unknown>
}

const auditApi = {
  list(params?: { page?: number, pageSize?: number, entityType?: string, entityId?: string, userId?: string, dateFrom?: string, dateTo?: string }) {
    const query = http.query({
      page: params?.page,
      pageSize: params?.pageSize,
      entityType: params?.entityType,
      entityId: params?.entityId,
      userId: params?.userId,
      dateFrom: params?.dateFrom,
      dateTo: params?.dateTo
    })
    return http.request<Paginated<AuditEntry>>(`/audit${query}`)
  }
}

export { auditApi }
export default auditApi
