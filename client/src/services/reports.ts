import { http } from './http'
import { type OrderStatus } from './types'

export interface OrdersReportRow {
  key: string
  count: number
  total: number
}

export interface OrdersReportResponse {
  groupBy: 'status' | 'manager' | 'day'
  data: OrdersReportRow[]
}

export interface OverdueOrder {
  id: string
  clientId: string
  clientName?: string
  status: OrderStatus
  total: number
  managerId?: string | null
  createdAt: string
}

export interface OverdueReportResponse {
  data: OverdueOrder[]
  total: number
  days: number
}

export const reportsApi = {
  orders(params?: { dateFrom?: string, dateTo?: string, status?: string, managerId?: string, groupBy?: 'status' | 'manager' | 'day' }) {
    const query = http.query(params ?? {})
    return http.request<OrdersReportResponse>(`/reports/orders${query}`)
  },
  overdue(params?: { page?: number, pageSize?: number, days?: number, status?: string, managerId?: string }) {
    const query = http.query(params ?? {})
    return http.request<OverdueReportResponse>(`/reports/overdue${query}`)
  }
}
