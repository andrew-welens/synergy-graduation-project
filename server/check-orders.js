const { PrismaClient } = require('@prisma/client')

;(async () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is required')
  }
  const p = new PrismaClient({ datasources: { db: { url } } })
  console.log('orders', await p.order.count())
  const noOrders = await p.client.findMany({ where: { orders: { none: {} } }, select: { id: true, name: true } })
  console.log('clients without orders', noOrders.length, noOrders)
  await p.$disconnect()
})()
