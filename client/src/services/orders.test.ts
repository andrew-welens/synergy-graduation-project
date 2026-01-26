import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ordersApi } from './orders'
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

describe('ordersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should list orders with default params', async () => {
    const mockResponse = { data: [], total: 0, page: 1, pageSize: 20 }
    vi.mocked(http.request).mockResolvedValueOnce(mockResponse)

    const result = await ordersApi.list()

    expect(http.request).toHaveBeenCalledWith('/orders')
    expect(result).toEqual(mockResponse)
  })

  it('should list orders with filters', async () => {
    const mockResponse = { data: [], total: 0, page: 1, pageSize: 20 }
    vi.mocked(http.request).mockResolvedValueOnce(mockResponse)

    await ordersApi.list({
      status: 'new',
      page: 2,
      pageSize: 10,
      clientId: 'client-1',
      managerId: 'manager-1',
      dateFrom: '2024-01-01',
      dateTo: '2024-01-31',
      sortBy: 'createdAt',
      sortDir: 'desc'
    })

    expect(http.request).toHaveBeenCalledWith('/orders?status=new&page=2&pageSize=10&clientId=client-1&managerId=manager-1&dateFrom=2024-01-01&dateTo=2024-01-31&sortBy=createdAt&sortDir=desc')
  })

  it('should get order by id', async () => {
    const mockOrder = { id: '1', status: 'new', total: 100 }
    vi.mocked(http.request).mockResolvedValueOnce(mockOrder)

    const result = await ordersApi.get('1')

    expect(http.request).toHaveBeenCalledWith('/orders/1')
    expect(result).toEqual(mockOrder)
  })

  it('should create order', async () => {
    const mockOrder = { id: '1', status: 'new', total: 100 }
    const payload = {
      clientId: 'client-1',
      items: [{ productId: 'product-1', quantity: 2, price: 50 }]
    }
    vi.mocked(http.request).mockResolvedValueOnce(mockOrder)

    const result = await ordersApi.create(payload)

    expect(http.request).toHaveBeenCalledWith('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    expect(result).toEqual(mockOrder)
  })

  it('should update order status', async () => {
    const mockOrder = { id: '1', status: 'in_progress', total: 100 }
    vi.mocked(http.request).mockResolvedValueOnce(mockOrder)

    const result = await ordersApi.updateStatus('1', 'in_progress')

    expect(http.request).toHaveBeenCalledWith('/orders/1/status', {
      method: 'POST',
      body: JSON.stringify({ status: 'in_progress' })
    })
    expect(result).toEqual(mockOrder)
  })

  it('should update order', async () => {
    const mockOrder = { id: '1', status: 'new', total: 150 }
    const payload = {
      items: [{ productId: 'product-1', quantity: 3, price: 50 }],
      comments: 'Updated order'
    }
    vi.mocked(http.request).mockResolvedValueOnce(mockOrder)

    const result = await ordersApi.update('1', payload)

    expect(http.request).toHaveBeenCalledWith('/orders/1', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
    expect(result).toEqual(mockOrder)
  })
})
