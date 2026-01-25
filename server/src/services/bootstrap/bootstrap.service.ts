import bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'

export class BootstrapService {
  constructor(private readonly prisma: PrismaService) {}

  async init() {
    await this.ensureAdmin()
    await this.ensureClients()
  }

  private async ensureAdmin() {
    const adminEmail = 'admin@example.com'
    const exists = await this.prisma.user.findUnique({ where: { email: adminEmail } })
    if (exists) return
    await this.prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: bcrypt.hashSync('password', 10),
        role: 'admin'
      }
    })
  }

  private async ensureClients() {
    const count = await this.prisma.client.count()
    if (count > 0) return
    const clients = Array.from({ length: 10 }).map((_, idx) => ({
      name: `Клиент ${idx + 1}`,
      email: `client${idx + 1}@example.com`,
      phone: `+70000000${(idx + 1).toString().padStart(2, '0')}`,
      city: 'Москва',
      address: `Улица ${idx + 1}, дом ${idx + 2}`,
      tags: JSON.stringify(['vip', 'new'].slice(0, 1 + (idx % 2)))
    }))
    await this.prisma.client.createMany({ data: clients })
  }
}
