import { http } from './http'
import { type AuthTokens, type RefreshResponse } from './types'

export const authApi = {
  login(email: string, password: string) {
    return http.request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  },
  refresh(refreshToken?: string) {
    return http.request<RefreshResponse>('/auth/refresh', {
      method: 'POST',
      body: refreshToken ? JSON.stringify({ refreshToken }) : undefined
    })
  },
  logout() {
    return http.request<{ ok: boolean }>('/auth/logout', { method: 'POST' })
  }
}
