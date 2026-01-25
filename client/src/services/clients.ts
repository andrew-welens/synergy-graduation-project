import { http } from './http'
import { type Client, type Paginated } from './types'

export const clientsApi = {
  list(params?: { page?: number, pageSize?: number, hasOrders?: boolean, search?: string, type?: 'legal' | 'individual', sortBy?: 'name' | 'email' | 'ordersCount' | 'createdAt', sortDir?: 'asc' | 'desc' }) {
    const query = http.query({ page: params?.page, pageSize: params?.pageSize, hasOrders: params?.hasOrders, search: params?.search, type: params?.type, sortBy: params?.sortBy, sortDir: params?.sortDir })
    return http.request<Paginated<Client>>(`/clients${query}`)
  },
  get(id: string) {
    return http.request<Client>(`/clients/${id}`)
  },
  create(payload: { name: string, email: string, phone: string, city?: string, address?: string, tags?: string[], type: 'legal' | 'individual', inn?: string }) {
    return http.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  update(id: string, payload: { name?: string, email?: string, phone?: string, city?: string, address?: string, tags?: string[], type?: 'legal' | 'individual', inn?: string }) {
    return http.request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },
  remove(id: string) {
    return http.request<{ message: string }>(`/clients/${id}`, {
      method: 'DELETE'
    })
  }
}
