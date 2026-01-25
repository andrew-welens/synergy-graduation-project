const { PrismaClient } = require('@prisma/client')
;(async () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is required')
  }
  const p = new PrismaClient({ datasources: { db: { url } } })
  console.log({
    users: await p.user.count(),
    clients: await p.client.count(),
    categories: await p.category.count(),
    products: await p.product.count(),
    orders: await p.order.count()
  })
  await p.$disconnect()
})()
