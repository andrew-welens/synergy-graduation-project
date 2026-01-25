import { PrismaClient } from '@prisma/client'

export class PrismaService extends PrismaClient {
  constructor() {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error('DATABASE_URL is required')
    }
    super({
      datasources: {
        db: { url }
      }
    })
  }

  async connect() {
    await this.$connect()
  }

  async disconnect() {
    await this.$disconnect()
  }
}
