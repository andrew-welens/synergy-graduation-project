import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authApi } from './auth'
import { http } from './http'

vi.mock('./http', () => ({
  http: {
    request: vi.fn()
  }
}))

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call login endpoint', async () => {
    const mockResponse = { accessToken: 'token', refreshToken: 'refresh', user: { id: '1', role: 'admin' } }
    vi.mocked(http.request).mockResolvedValueOnce(mockResponse)

    const result = await authApi.login('test@example.com', 'password123')

    expect(http.request).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    })
    expect(result).toEqual(mockResponse)
  })

  it('should call refresh endpoint without token', async () => {
    const mockResponse = { accessToken: 'new-token', user: { id: '1', role: 'admin' } }
    vi.mocked(http.request).mockResolvedValueOnce(mockResponse)

    const result = await authApi.refresh()

    expect(http.request).toHaveBeenCalledWith('/auth/refresh', {
      method: 'POST',
      body: undefined
    })
    expect(result).toEqual(mockResponse)
  })

  it('should call refresh endpoint with token', async () => {
    const mockResponse = { accessToken: 'new-token', user: { id: '1', role: 'admin' } }
    vi.mocked(http.request).mockResolvedValueOnce(mockResponse)

    const result = await authApi.refresh('refresh-token')

    expect(http.request).toHaveBeenCalledWith('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'refresh-token' })
    })
    expect(result).toEqual(mockResponse)
  })

  it('should call logout endpoint', async () => {
    const mockResponse = { ok: true }
    vi.mocked(http.request).mockResolvedValueOnce(mockResponse)

    const result = await authApi.logout()

    expect(http.request).toHaveBeenCalledWith('/auth/logout', {
      method: 'POST'
    })
    expect(result).toEqual(mockResponse)
  })
})
