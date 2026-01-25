import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { AuditLog, Category, Client, Interaction, Order, Product, User } from '../types/models'

const now = () => new Date().toISOString()

const seedUser: User = {
  id: randomUUID(),
  email: 'admin@example.com',
  passwordHash: bcrypt.hashSync('password', 10),
  role: 'admin',
  createdAt: now(),
  updatedAt: now()
}

export const db = {
  users: [seedUser] as User[],
  clients: [] as Client[],
  categories: [] as Category[],
  products: [] as Product[],
  orders: [] as Order[],
  interactions: [] as Interaction[],
  audit: [] as AuditLog[]
}

export const createAudit = (actorId: string, action: string, resource: string, metadata?: Record<string, unknown>) => {
  const entry: AuditLog = {
    id: randomUUID(),
    actorId,
    action,
    resource,
    createdAt: now(),
    metadata
  }
  db.audit.unshift(entry)
  return entry
}

export const timestamps = () => ({ createdAt: now(), updatedAt: now() })
