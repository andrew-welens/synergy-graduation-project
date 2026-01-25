import { http } from './http'
import { type User } from './types'

export const usersApi = {
  list() {
    return http.request<User[]>('/users')
  },
  create(payload: { email: string, password: string, role: User['role'], name?: string }) {
    return http.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  update(id: string, payload: { email?: string, password?: string, role?: User['role'], name?: string }) {
    return http.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },
  remove(id: string) {
    return http.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE'
    })
  }
}
