const { PrismaClient } = require('@prisma/client')

;(async () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is required')
  }
  const p = new PrismaClient({ datasources: { db: { url } } })
  console.log(await p.user.findMany())
  await p.$disconnect()
})()
