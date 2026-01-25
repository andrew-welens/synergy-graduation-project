import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { AuditLog, Category, Client, Interaction, Order, Product, User } from '../types/models'

const nowIso = () => new Date().toISOString()
const nowDate = () => new Date()

const seedUser: User = {
  id: randomUUID(),
  email: 'admin@example.com',
  passwordHash: bcrypt.hashSync('password', 10),
  role: 'admin',
  createdAt: nowIso(),
  updatedAt: nowIso()
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

export const createAudit = (actorId: string, action: string, entityType: string, metadata?: Record<string, unknown>) => {
  const entry: AuditLog = {
    id: randomUUID(),
    actorId,
    action,
    entityType,
    createdAt: nowDate(),
    metadata
  }
  db.audit.unshift(entry)
  return entry
}

export const timestamps = () => ({ createdAt: nowDate(), updatedAt: nowDate() })
