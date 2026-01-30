import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // очистка, чтобы не копить старые данные
  await prisma.orderStatusHistory.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.interaction.deleteMany()
  await prisma.client.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.auditLog.deleteMany()

  const adminEmail = 'admin@example.com'
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { firstName: 'Администратор', lastName: 'Системы', role: 'admin' },
    create: {
      email: adminEmail,
      firstName: 'Администратор',
      lastName: 'Системы',
      passwordHash: bcrypt.hashSync('password', 10),
      role: 'admin',
      isActive: true
    }
  })
  const staffUsers = [
    { email: 'manager1@example.com', role: 'manager', firstName: 'Илья', lastName: 'Петров' },
    { email: 'manager2@example.com', role: 'manager', firstName: 'Анна', lastName: 'Смирнова' },
    { email: 'manager3@example.com', role: 'manager', firstName: 'Артем', lastName: 'Ковалев' },
    { email: 'operator1@example.com', role: 'operator', firstName: 'Мария', lastName: 'Лебедева' },
    { email: 'operator2@example.com', role: 'operator', firstName: 'Павел', lastName: 'Никифоров' }
  ]
  for (const user of staffUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { firstName: user.firstName, lastName: user.lastName, role: user.role },
      create: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        passwordHash: bcrypt.hashSync('password', 10),
        role: user.role,
        isActive: true
      }
    })
  }
  const managers = await prisma.user.findMany({
    where: { role: { in: ['manager', 'operator'] } },
    select: { id: true }
  })

  const firstNames = [
    { ru: 'Алексей', en: 'alexey' },
    { ru: 'Артем', en: 'artem' },
    { ru: 'Борис', en: 'boris' },
    { ru: 'Вадим', en: 'vadim' },
    { ru: 'Валерий', en: 'valeriy' },
    { ru: 'Виктор', en: 'viktor' },
    { ru: 'Виталий', en: 'vitaliy' },
    { ru: 'Глеб', en: 'gleb' },
    { ru: 'Григорий', en: 'grigory' },
    { ru: 'Даниил', en: 'daniil' },
    { ru: 'Денис', en: 'denis' },
    { ru: 'Евгений', en: 'evgeniy' },
    { ru: 'Елисей', en: 'elisey' },
    { ru: 'Илья', en: 'ilya' },
    { ru: 'Кирилл', en: 'kirill' },
    { ru: 'Константин', en: 'konstantin' },
    { ru: 'Лев', en: 'lev' },
    { ru: 'Максим', en: 'maksim' },
    { ru: 'Матвей', en: 'matvey' },
    { ru: 'Марк', en: 'mark' },
    { ru: 'Николай', en: 'nikolay' },
    { ru: 'Павел', en: 'pavel' },
    { ru: 'Петр', en: 'petr' },
    { ru: 'Роман', en: 'roman' },
    { ru: 'Руслан', en: 'ruslan' },
    { ru: 'Савелий', en: 'saveliy' },
    { ru: 'Семен', en: 'semen' },
    { ru: 'Степан', en: 'stepan' },
    { ru: 'Тимофей', en: 'timofey' },
    { ru: 'Федор', en: 'fedor' },
    { ru: 'Юрий', en: 'yuriy' },
    { ru: 'Ярослав', en: 'yaroslav' },
    { ru: 'Антон', en: 'anton' },
    { ru: 'Анатолий', en: 'anatoliy' },
    { ru: 'Вячеслав', en: 'vyacheslav' },
    { ru: 'Егор', en: 'egor' },
    { ru: 'Игорь', en: 'igor' },
    { ru: 'Леонид', en: 'leonid' },
    { ru: 'Михаил', en: 'mikhail' },
    { ru: 'Станислав', en: 'stanislav' },
    { ru: 'Тарас', en: 'taras' },
    { ru: 'Филипп', en: 'filipp' },
    { ru: 'Эдуард', en: 'eduard' },
    { ru: 'Арсений', en: 'arseniy' },
    { ru: 'Богдан', en: 'bogdan' },
    { ru: 'Вениамин', en: 'veniamin' },
    { ru: 'Герман', en: 'german' },
    { ru: 'Давид', en: 'david' },
    { ru: 'Жанна', en: 'zhanna' }
  ]
  const lastNamePrefixes = [
    'Альт',
    'Берилл',
    'Вулкан',
    'Гранит',
    'Дубрав',
    'Ельник',
    'Журав',
    'Злат',
    'Изумруд',
    'Кедр',
    'Лазур',
    'Магнит',
    'Нефрит',
    'Оникс',
    'Платин',
    'Рубин',
    'Сапфир',
    'Топаз',
    'Ураган',
    'Феникс',
    'Хризолит',
    'Центур',
    'Чайка',
    'Шторм',
    'Эдель',
    'Янтар',
    'Беркут',
    'Витяз',
    'Горизонт',
    'Дельта',
    'Европ',
    'Жемчуг',
    'Зефир',
    'Иней',
    'Космос',
    'Лабиринт',
    'Метеор',
    'Норд',
    'Орион',
    'Пульс',
    'Радар',
    'Сигнал',
    'Тайфун',
    'Ультра',
    'Факел',
    'Хрусталь',
    'Цитрон',
    'Чароит',
    'Шифр',
    'Эфир'
  ]
  const lastNameSuffixes = ['ов', 'ин', 'енко', 'ский', 'ич']
  const translitMap: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'kh',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'shch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya'
  }
  const toEn = (value: string) => value.toLowerCase().split('').map((ch) => translitMap[ch] ?? '').join('')
  const lastNames = lastNameSuffixes
    .flatMap((suffix) => lastNamePrefixes.map((prefix) => `${prefix}${suffix}`))
    .map((ru) => ({ ru, en: toEn(ru) }))
  const middleNames = [
    'Алексеевич',
    'Анатольевич',
    'Андреевич',
    'Аркадьевич',
    'Борисович',
    'Вадимович',
    'Валерьевич',
    'Викторович',
    'Витальевич',
    'Григорьевич',
    'Даниилович',
    'Денисович',
    'Евгеньевич',
    'Егорович',
    'Игоревич',
    'Ильич',
    'Константинович',
    'Леонидович',
    'Максимович',
    'Матвеевич',
    'Михайлович',
    'Николаевич',
    'Олегович',
    'Павлович',
    'Петрович',
    'Романович',
    'Русланович',
    'Сергеевич',
    'Станиславович',
    'Тимофеевич',
    'Федорович',
    'Юрьевич',
    'Ярославович',
    'Алексеевна',
    'Анатольевна',
    'Андреевна',
    'Аркадьевна',
    'Борисовна',
    'Вадимовна',
    'Валерьевна',
    'Викторовна',
    'Витальевна',
    'Григорьевна',
    'Данииловна',
    'Денисовна',
    'Евгеньевна',
    'Егоровна',
    'Игоревна',
    'Ильинична',
    'Константиновна'
  ]
  const cities = [
    'Москва',
    'Санкт-Петербург',
    'Казань',
    'Екатеринбург',
    'Новосибирск',
    'Нижний Новгород',
    'Самара',
    'Ростов-на-Дону',
    'Уфа',
    'Краснодар'
  ]
  const streets = [
    'Тверская',
    'Арбат',
    'Ленина',
    'Победы',
    'Мира',
    'Советская',
    'Школьная',
    'Садовая',
    'Комсомольская',
    'Набережная'
  ]
  const tagsPool = ['vip', 'new', 'b2b', 'retail', 'loyal']

  const clients = Array.from({ length: 250 }).map((_, idx) => {
    const first = firstNames[idx % firstNames.length]
    const last = lastNames[idx]
    const middle = middleNames[idx % middleNames.length]
    const city = cities[idx % cities.length]
    const street = streets[idx % streets.length]
    const isLegal = idx % 3 === 0
    const email = `${last.en}.${first.en}${idx + 1}@example.com`
    const phone = `+7${(9000000000 + idx).toString().slice(0, 10)}`
    const address = `ул. ${street}, д. ${(idx % 50) + 1}, кв. ${((idx * 3) % 120) + 1}`
    const tagCount = 1 + (idx % 3)
    const tags = Array.from({ length: tagCount }).map((_, tIdx) => tagsPool[(idx + tIdx) % tagsPool.length])
    return {
      name: `${last.ru} ${first.ru} ${middle}`,
      email,
      phone,
      city,
      address,
      tags: JSON.stringify(tags),
      type: isLegal ? 'legal' : 'individual',
      inn: isLegal ? `77${(10000000 + idx).toString().padStart(8, '0')}`.slice(0, 10) : null
    }
  })
  await prisma.client.createMany({ data: clients })

  const categories = await prisma.category.createMany({
    data: [
      { name: 'Ноутбуки', description: 'Портативные компьютеры' },
      { name: 'Роутеры', description: 'Беспроводные маршрутизаторы' },
      { name: 'Модемы', description: 'Модемы для подключения к сети' },
      { name: 'Смартфоны', description: 'Мобильные телефоны' },
      { name: 'Планшеты', description: 'Планшетные компьютеры' }
    ]
  })
  const catIds = await prisma.category.findMany({ select: { id: true, name: true } })
  const getCat = (name: string) => catIds.find((c) => c.name === name)?.id
  const products = [
    { name: 'Ноутбук 15" базовый', categoryId: getCat('Ноутбуки'), price: 44990, unit: 'шт', isAvailable: true, sku: 'NB-15-B' },
    { name: 'Ноутбук 15" Pro', categoryId: getCat('Ноутбуки'), price: 79990, unit: 'шт', isAvailable: true, sku: 'NB-15-P' },
    { name: 'Ноутбук 13" ультрабук', categoryId: getCat('Ноутбуки'), price: 69990, unit: 'шт', isAvailable: true, sku: 'NB-13-U' },
    { name: 'Роутер Wi-Fi 5', categoryId: getCat('Роутеры'), price: 2990, unit: 'шт', isAvailable: true, sku: 'RT-W5' },
    { name: 'Роутер Wi-Fi 6', categoryId: getCat('Роутеры'), price: 5990, unit: 'шт', isAvailable: true, sku: 'RT-W6' },
    { name: 'Роутер Mesh комплект', categoryId: getCat('Роутеры'), price: 12990, unit: 'шт', isAvailable: true, sku: 'RT-MESH' },
    { name: 'Модем USB 4G', categoryId: getCat('Модемы'), price: 2490, unit: 'шт', isAvailable: true, sku: 'MD-USB-4G' },
    { name: 'Модем стационарный 4G', categoryId: getCat('Модемы'), price: 4990, unit: 'шт', isAvailable: true, sku: 'MD-4G-ST' },
    { name: 'Модем 5G', categoryId: getCat('Модемы'), price: 8990, unit: 'шт', isAvailable: true, sku: 'MD-5G' },
    { name: 'Смартфон базовый', categoryId: getCat('Смартфоны'), price: 14990, unit: 'шт', isAvailable: true, sku: 'SM-BASE' },
    { name: 'Смартфон средний', categoryId: getCat('Смартфоны'), price: 29990, unit: 'шт', isAvailable: true, sku: 'SM-MID' },
    { name: 'Смартфон флагман', categoryId: getCat('Смартфоны'), price: 59990, unit: 'шт', isAvailable: true, sku: 'SM-FLAG' },
    { name: 'Планшет 8"', categoryId: getCat('Планшеты'), price: 19990, unit: 'шт', isAvailable: true, sku: 'TB-8' },
    { name: 'Планшет 10"', categoryId: getCat('Планшеты'), price: 34990, unit: 'шт', isAvailable: true, sku: 'TB-10' },
    { name: 'Планшет 11" Pro', categoryId: getCat('Планшеты'), price: 49990, unit: 'шт', isAvailable: true, sku: 'TB-11-P' }
  ].filter((p) => p.categoryId)
  await prisma.product.createMany({ data: products as any })

  const clientList = await prisma.client.findMany({ select: { id: true } })
  const productList = await prisma.product.findMany({ select: { id: true, price: true } })

  const now = Date.now()
  const daysAgo = (value: number) => new Date(now - value * 24 * 60 * 60 * 1000)
  const addDays = (value: Date, offset: number) => new Date(value.getTime() + offset * 24 * 60 * 60 * 1000)
  const makeOrder = (
    clientId: string,
    productIdx: number,
    qty: number,
    status: 'new' | 'in_progress' | 'done' | 'canceled',
    createdAt: Date,
    completedAt?: Date,
    managerId?: string
  ) => {
    const product = productList[productIdx % productList.length]
    const total = product.price * qty
    return {
      clientId,
      status,
      total,
      managerId,
      createdAt,
      updatedAt: createdAt,
      completedAt: completedAt ?? undefined,
      items: {
        create: [{ productId: product.id, quantity: qty, price: product.price, total: product.price * qty }]
      },
      history: {
        create: [{ fromStatus: null, toStatus: status, changedByUserId: null, createdAt }]
      }
    }
  }

  const ordersData = []
  for (let i = 0; i < clientList.length; i++) {
    const clientId = clientList[i].id
    const managerId = managers.length > 0 ? managers[i % managers.length].id : undefined
    const oldCreatedAt = daysAgo(60 + (i % 40))
    const oldCompletedAt = addDays(oldCreatedAt, 2 + (i % 7))
    const activeCreatedAt = daysAgo(1 + (i % 5))
    const activeStatus = i % 2 === 0 ? 'new' : 'in_progress'
    ordersData.push(makeOrder(clientId, i, (i % 3) + 1, 'done', oldCreatedAt, oldCompletedAt, managerId))
    ordersData.push(makeOrder(clientId, i + 3, (i % 4) + 1, activeStatus, activeCreatedAt, undefined, managerId))
    if (i % 4 === 0) {
      const overdueCreatedAt = daysAgo(10 + (i % 20))
      ordersData.push(makeOrder(clientId, i + 6, (i % 2) + 1, 'in_progress', overdueCreatedAt, undefined, managerId))
    }
  }

  for (const data of ordersData) {
    await prisma.order.create({ data })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
