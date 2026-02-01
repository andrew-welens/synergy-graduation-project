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

export interface ExportDataResponse {
  summary: OrdersReportResponse
  orders: Array<{
    id: string
    clientId: string
    clientName?: string
    status: string
    total: number
    totalAmount?: number
    comments?: string
    managerId?: string
    managerName?: string
    managerEmail?: string
    createdAt: string
    completedAt?: string
    items: Array<{ productId: string, quantity: number, price: number, total: number }>
  }>
  products: Array<{ id: string, name: string }>
  clients: Array<{
    id: string
    name: string
    email?: string
    phone?: string
    city?: string
    address?: string
    type: string
    inn?: string
    tags: string[]
    ordersCount: number
    interactionsCount: number
    createdAt: string
    updatedAt: string
  }>
}

export const reportsApi = {
  orders(params?: { dateFrom?: string, dateTo?: string, status?: string, managerId?: string, groupBy?: 'status' | 'manager' | 'day' }) {
    const query = http.query(params ?? {})
    return http.request<OrdersReportResponse>(`/reports/orders${query}`)
  },
  exportData(params: { dateFrom?: string, dateTo?: string, status?: string, managerId?: string, groupBy?: 'status' | 'manager' | 'day' }) {
    const query = http.query(params)
    return http.request<ExportDataResponse>(`/reports/export${query}`)
  },
  overdue(params?: { page?: number, pageSize?: number, days?: number, status?: string, managerId?: string }) {
    const query = http.query(params ?? {})
    return http.request<OverdueReportResponse>(`/reports/overdue${query}`)
  }
}
