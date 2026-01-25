import { http } from './http'
import { type Order, type Paginated } from './types'

export const ordersApi = {
  list(params?: { status?: string, page?: number, pageSize?: number, clientId?: string, managerId?: string, dateFrom?: string, dateTo?: string, sortBy?: 'status' | 'total' | 'createdAt', sortDir?: 'asc' | 'desc' }) {
    const query = http.query({ status: params?.status, page: params?.page, pageSize: params?.pageSize, clientId: params?.clientId, managerId: params?.managerId, dateFrom: params?.dateFrom, dateTo: params?.dateTo, sortBy: params?.sortBy, sortDir: params?.sortDir })
    return http.request<Paginated<Order>>(`/orders${query}`)
  },
  get(id: string) {
    return http.request<Order>(`/orders/${id}`)
  },
  create(payload: { clientId: string, status?: string, managerId?: string, comments?: string, items: { productId: string, quantity: number, price: number }[] }) {
    return http.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  updateStatus(id: string, status: string) {
    return http.request<Order>(`/orders/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    })
  },
  update(id: string, payload: { items?: { productId: string, quantity: number, price: number }[], managerId?: string, comments?: string }) {
    return http.request<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  }
}
