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
    'clients.read',
    'clients.write',
    'clients.delete',
    'orders.read',
    'orders.write',
    'orders.status.change',
    'catalog.read',
    'catalog.write',
    'reports.read',
    'audit.read',
    'users.manage',
    'interactions.read',
    'interactions.write'
  ],
  manager: [
    'clients.read',
    'clients.write',
    'orders.read',
    'orders.write',
    'orders.status.change',
    'catalog.read',
    'catalog.write',
    'reports.read',
    'audit.read',
    'interactions.read',
    'interactions.write'
  ],
  operator: [
    'clients.read',
    'clients.write',
    'orders.read',
    'orders.write',
    'orders.status.change',
    'catalog.read',
    'interactions.read',
    'interactions.write'
  ],
  analyst: [
    'clients.read',
    'orders.read',
    'reports.read',
    'audit.read',
    'interactions.read'
  ]
}

export interface User {
  id: string
  email: string
  name?: string
  passwordHash: string
  role: Role
  createdAt: string
  updatedAt: string
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
  createdAt: Date
  updatedAt: Date
  ordersCount?: number
}

export interface Category {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  categoryId: string
  price: number
  unit: string
  isAvailable: boolean
  sku?: string
  createdAt: Date
  updatedAt: Date
}

export enum OrderStatus {
  New = 'new',
  InProgress = 'in_progress',
  Done = 'done',
  Canceled = 'canceled'
}

export interface OrderItem {
  productId: string
  quantity: number
  price: number
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
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface Interaction {
  id: string
  clientId: string
  channel: string
  description: string
  createdAt: Date
  managerId?: string
}

export interface AuditLog {
  id: string
  actorId: string
  action: string
  entityType: string
  entityId?: string
  createdAt: Date
  metadata?: Record<string, unknown>
}

export interface OrderStatusHistory {
  id: string
  orderId: string
  status: OrderStatus
  actorId?: string
  createdAt: Date
}
