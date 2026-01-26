import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { http } from './http'

global.fetch = vi.fn()

describe('http', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should make successful request', async () => {
    const mockData = { data: { id: '1', name: 'Test' } }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockData)
    } as Response)

    const result = await http.request('/test')

    expect(fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      credentials: 'include',
      headers: expect.objectContaining({
        'Content-Type': 'application/json'
      })
    }))
    expect(result).toEqual(mockData.data)
  })

  it('should handle JSON response', async () => {
    const mockData = { data: { success: true } }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockData)
    } as Response)

    const result = await http.request('/test')
    expect(result).toEqual(mockData.data)
  })

  it('should handle empty response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => ''
    } as Response)

    const result = await http.request('/test')
    expect(result).toBeNull()
  })

  it('should throw error on non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ message: 'Bad request' })
    } as Response)

    await expect(http.request('/test')).rejects.toThrow('Bad request')
  })

  it('should redirect to login on 401', async () => {
    const originalLocation = window.location
    const mockAssign = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { assign: mockAssign, pathname: '/test', search: '' },
      writable: true,
      configurable: true
    })

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ message: 'Unauthorized' })
    } as Response)

    await expect(http.request('/test')).rejects.toThrow()
    expect(sessionStorage.getItem('authRedirect')).toBeTruthy()
    expect(mockAssign).toHaveBeenCalledWith('/login')

    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true
    })
  })

  it('should build query string correctly', () => {
    const params = { page: 1, size: 20, search: 'test' }
    const query = http.query(params)
    expect(query).toBe('?page=1&size=20&search=test')
  })

  it('should filter out undefined values in query', () => {
    const params = { page: 1, size: undefined, search: 'test' }
    const query = http.query(params)
    expect(query).toBe('?page=1&search=test')
  })

  it('should return empty string for empty query', () => {
    const params = {}
    const query = http.query(params)
    expect(query).toBe('')
  })
})
