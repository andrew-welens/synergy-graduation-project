import { http } from './http'
import { type Interaction, type Paginated } from './types'

export const interactionsApi = {
  list(clientId: string, params?: { channel?: string, dateFrom?: string, dateTo?: string, page?: number, pageSize?: number }) {
    const query = http.query({ channel: params?.channel, dateFrom: params?.dateFrom, dateTo: params?.dateTo, page: params?.page, pageSize: params?.pageSize })
    return http.request<Paginated<Interaction>>(`/clients/${clientId}/interactions${query}`)
  },
  create(clientId: string, payload: { channel: string, description: string }) {
    return http.request<Interaction>(`/clients/${clientId}/interactions`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  update(clientId: string, id: string, payload: { channel?: string, description?: string }) {
    return http.request<Interaction>(`/clients/${clientId}/interactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },
  remove(clientId: string, id: string) {
    return http.request<{ message: string }>(`/clients/${clientId}/interactions/${id}`, {
      method: 'DELETE'
    })
  }
}
