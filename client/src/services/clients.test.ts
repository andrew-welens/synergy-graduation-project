import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clientsApi } from './clients'
import { http } from './http'

vi.mock('./http', () => ({
  http: {
    request: vi.fn(),
    query: vi.fn((params) => {
      const search = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
      return search ? `?${search}` : ''
    })
  }
}))

describe('clientsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should list clients with default params', async () => {
    const mockResponse = { data: [], total: 0, page: 1, pageSize: 20 }
    vi.mocked(http.request).mockResolvedValueOnce(mockResponse)

    const result = await clientsApi.list()

    expect(http.request).toHaveBeenCalledWith('/clients')
    expect(result).toEqual(mockResponse)
  })

  it('should list clients with filters', async () => {
    const mockResponse = { data: [], total: 0, page: 1, pageSize: 20 }
    vi.mocked(http.request).mockResolvedValueOnce(mockResponse)

    await clientsApi.list({
      page: 2,
      pageSize: 10,
      search: 'test',
      type: 'legal',
      sortBy: 'name',
      sortDir: 'asc'
    })

    expect(http.request).toHaveBeenCalledWith('/clients?page=2&pageSize=10&search=test&type=legal&sortBy=name&sortDir=asc')
  })

  it('should get client by id', async () => {
    const mockClient = { id: '1', name: 'Test Client' }
    vi.mocked(http.request).mockResolvedValueOnce(mockClient)

    const result = await clientsApi.get('1')

    expect(http.request).toHaveBeenCalledWith('/clients/1')
    expect(result).toEqual(mockClient)
  })

  it('should create client', async () => {
    const mockClient = { id: '1', name: 'New Client' }
    const payload = { name: 'New Client', type: 'legal' as const }
    vi.mocked(http.request).mockResolvedValueOnce(mockClient)

    const result = await clientsApi.create(payload)

    expect(http.request).toHaveBeenCalledWith('/clients', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    expect(result).toEqual(mockClient)
  })

  it('should update client', async () => {
    const mockClient = { id: '1', name: 'Updated Client' }
    const payload = { name: 'Updated Client' }
    vi.mocked(http.request).mockResolvedValueOnce(mockClient)

    const result = await clientsApi.update('1', payload)

    expect(http.request).toHaveBeenCalledWith('/clients/1', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
    expect(result).toEqual(mockClient)
  })

  it('should delete client', async () => {
    const mockResponse = { message: 'Client deleted' }
    vi.mocked(http.request).mockResolvedValueOnce(mockResponse)

    const result = await clientsApi.remove('1')

    expect(http.request).toHaveBeenCalledWith('/clients/1', {
      method: 'DELETE'
    })
    expect(result).toEqual(mockResponse)
  })
})
