export type Role = 'admin' | 'manager' | 'operator' | 'analyst'

export type Permission =
  | 'clients.read'
  | 'clients.write'
  | 'clients.delete'
  | 'orders.read'
  | 'orders.write'
  | 'orders.status.change'
  | 'catalog.read'
  | 'catalog.write'
  | 'reports.read'
  | 'audit.read'
  | 'users.manage'
  | 'interactions.read'
  | 'interactions.write'

export const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    'clients.read', 'clients.write', 'clients.delete',
    'orders.read', 'orders.write', 'orders.status.change',
    'catalog.read', 'catalog.write', 'reports.read', 'audit.read',
    'users.manage', 'interactions.read', 'interactions.write'
  ],
  manager: [
    'clients.read', 'clients.write', 'orders.read', 'orders.write', 'orders.status.change',
    'catalog.read', 'catalog.write', 'reports.read', 'audit.read',
    'interactions.read', 'interactions.write'
  ],
  operator: [
    'clients.read', 'clients.write', 'orders.read', 'orders.write', 'orders.status.change',
    'catalog.read', 'interactions.read', 'interactions.write'
  ],
  analyst: [
    'clients.read', 'reports.read', 'audit.read', 'interactions.read'
  ]
}

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  isActive: boolean
  role: Role
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    role: Role
    permissions: string[]
  }
}

export interface RefreshResponse {
  accessToken: string
  user: {
    id: string
    email: string
    role: Role
    permissions: string[]
  }
}

export interface Paginated<T> {
  data: T[]
  total: number
}

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  city?: string
  address?: string
  managerId?: string
  tags: string[]
  type: 'legal' | 'individual'
  inn?: string
  createdAt: string
  updatedAt: string
  ordersCount?: number
  interactionsCount?: number
}

export interface Category {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  categoryId: string
  price: number
  unit: string
  isAvailable: boolean
  sku?: string
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 'new' | 'in_progress' | 'done' | 'canceled'

export interface OrderItem {
  productId: string
  quantity: number
  price: number
  total: number
}

export interface Order {
  id: string
  clientId: string
  clientName?: string
  items: OrderItem[]
  total: number
  totalAmount?: number
  status: OrderStatus
  comments?: string
  managerId?: string
  managerName?: string
  managerEmail?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  history?: OrderStatusHistory[]
}

export interface Interaction {
  id: string
  clientId: string
  channel: string
  description: string
  createdAt: string
  updatedAt: string
  managerId?: string
}

export interface OrderStatusHistory {
  id: string
  orderId: string
  fromStatus?: OrderStatus
  toStatus: OrderStatus
  changedByUserId?: string
  createdAt: string
}
