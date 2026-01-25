import { http } from './http'
import { type AuthTokens } from './types'

export const authApi = {
  login(email: string, password: string) {
    return http.request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  },
  me() {
    return http.request<{ id: string, email: string, role: string, permissions: string[] }>('/auth/me')
  },
  refresh(refreshToken?: string) {
    return http.request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: refreshToken ? JSON.stringify({ refreshToken }) : undefined
    })
  },
  logout() {
    return http.request<{ ok: boolean }>('/auth/logout', { method: 'POST' })
  }
}
