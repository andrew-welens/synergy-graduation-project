import { http } from './http'
import { type Category, type Paginated, type Product } from './types'

export const catalogApi = {
  categories(params?: { search?: string, page?: number, pageSize?: number }) {
    const query = http.query({ search: params?.search, page: params?.page, pageSize: params?.pageSize })
    return http.request<Paginated<Category>>(`/categories${query}`)
  },
  products(params?: { categoryId?: string, isAvailable?: boolean, search?: string, page?: number, pageSize?: number }) {
    const query = http.query({
      categoryId: params?.categoryId,
      isAvailable: params?.isAvailable,
      search: params?.search,
      page: params?.page,
      pageSize: params?.pageSize
    })
    return http.request<Paginated<Product>>(`/products${query}`)
  },
  createCategory(payload: { name: string, description?: string }) {
    return http.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  updateCategory(id: string, payload: { name?: string, description?: string }) {
    return http.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },
  createProduct(payload: { name: string, categoryId: string, price: number, unit: 'шт' | 'усл.' | 'мес.', isAvailable: boolean, sku?: string }) {
    return http.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  updateProduct(id: string, payload: { name?: string, categoryId?: string, price?: number, unit?: 'шт' | 'усл.' | 'мес.', isAvailable?: boolean, sku?: string }) {
    return http.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  }
}
