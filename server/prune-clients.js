const { PrismaClient } = require('@prisma/client')

;(async () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is required')
  }
  const p = new PrismaClient({ datasources: { db: { url } } })
  const res = await p.client.deleteMany({ where: { orders: { none: {} } } })
  console.log('deleted', res.count)
  await p.$disconnect()
})()
