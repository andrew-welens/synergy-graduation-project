import * as XLSX from 'xlsx'
import { reportsApi } from '../services/reports'
import { type OrderStatus } from '../services/types'

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый',
  in_progress: 'В обработке',
  done: 'Выполнен',
  canceled: 'Отменен'
}

const statusLabel = (status: OrderStatus) => STATUS_LABELS[status] ?? status

export interface OrdersReportExportFilters {
  groupBy: 'status' | 'manager' | 'day'
  dateFrom?: string
  dateTo?: string
  status?: OrderStatus
  managerId?: string
}

export async function exportOrdersReport(filters: OrdersReportExportFilters): Promise<void> {
  const { summary, orders, products, clients } = await reportsApi.exportData({
    groupBy: filters.groupBy,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    status: filters.status,
    managerId: filters.managerId
  })

  const productMap = new Map(products.map((p) => [p.id, p.name]))

  const groupLabel = summary.groupBy === 'manager' ? 'Менеджер' : summary.groupBy === 'day' ? 'Дата' : 'Статус'
  const summaryHeader = [groupLabel, 'Количество', 'Сумма']
  const summaryRows = summary.data.map((row) => [
    summary.groupBy === 'status' ? statusLabel(row.key as OrderStatus) : row.key,
    row.count,
    row.total
  ])
  const summarySheetData = [summaryHeader, ...summaryRows]
  const summaryWorksheet = XLSX.utils.aoa_to_sheet(summarySheetData)
  summaryWorksheet['!cols'] = [{ wch: 24 }, { wch: 14 }, { wch: 16 }]

  const detailsHeader = ['ID', 'Клиент', 'Статус', 'Сумма', 'Позиции', 'Кол-во товаров', 'Комментарий', 'Ответственный (ФИО)', 'Ответственный (email)', 'Создан', 'Завершен']
  const detailsRows = orders.map((order) => ([
    order.id,
    order.clientName ?? order.clientId,
    statusLabel(order.status as OrderStatus),
    order.totalAmount ?? order.total,
    order.items?.length ?? 0,
    order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    order.comments ?? '',
    order.managerName ?? '',
    order.managerEmail ?? '',
    new Date(order.createdAt).toLocaleString(),
    order.completedAt ? new Date(order.completedAt).toLocaleString() : ''
  ]))
  const detailsSheetData = [detailsHeader, ...detailsRows]
  const detailsWorksheet = XLSX.utils.aoa_to_sheet(detailsSheetData)
  detailsWorksheet['!cols'] = [{ wch: 38 }, { wch: 28 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 16 }, { wch: 28 }, { wch: 26 }, { wch: 28 }, { wch: 20 }, { wch: 20 }]

  const productStats = new Map<string, { productId: string, productName: string, quantity: number, revenue: number, ordersCount: number }>()
  orders.forEach((order) => {
    const seen = new Set<string>()
    order.items?.forEach((item) => {
      const productId = item.productId
      const current = productStats.get(productId) ?? {
        productId,
        productName: productMap.get(productId) ?? productId,
        quantity: 0,
        revenue: 0,
        ordersCount: 0
      }
      current.quantity += item.quantity
      current.revenue += item.quantity * item.price
      if (!seen.has(productId)) {
        current.ordersCount += 1
        seen.add(productId)
      }
      productStats.set(productId, current)
    })
  })
  const productsHeader = ['Товар ID', 'Товар', 'Кол-во', 'Выручка', 'Заказы']
  const productsRows = Array.from(productStats.values())
    .sort((a, b) => b.quantity - a.quantity)
    .map((row) => [row.productId, row.productName, row.quantity, row.revenue, row.ordersCount])
  const productsSheetData = [productsHeader, ...productsRows]
  const productsWorksheet = XLSX.utils.aoa_to_sheet(productsSheetData)
  productsWorksheet['!cols'] = [{ wch: 38 }, { wch: 32 }, { wch: 12 }, { wch: 16 }, { wch: 12 }]

  const typeLabel = (t: string) => (t === 'legal' ? 'Юр. лицо' : 'Физ. лицо')
  const clientsHeader = ['ID', 'Наименование', 'Email', 'Телефон', 'Город', 'Адрес', 'Тип', 'ИНН', 'Теги', 'Заказов', 'Взаимодействия', 'Создан', 'Обновлен']
  const clientsRows = clients.map((c) => [
    c.id,
    c.name,
    c.email ?? '',
    c.phone ?? '',
    c.city ?? '',
    c.address ?? '',
    typeLabel(c.type),
    c.inn ?? '',
    (c.tags ?? []).join(', '),
    c.ordersCount ?? 0,
    c.interactionsCount ?? 0,
    new Date(c.createdAt).toLocaleString(),
    new Date(c.updatedAt).toLocaleString()
  ])
  const clientsSheetData = [clientsHeader, ...clientsRows]
  const clientsWorksheet = XLSX.utils.aoa_to_sheet(clientsSheetData)
  clientsWorksheet['!cols'] = [{ wch: 38 }, { wch: 32 }, { wch: 28 }, { wch: 16 }, { wch: 20 }, { wch: 36 }, { wch: 12 }, { wch: 14 }, { wch: 24 }, { wch: 10 }, { wch: 16 }, { wch: 20 }, { wch: 20 }]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Сводка')
  XLSX.utils.book_append_sheet(workbook, detailsWorksheet, 'Заказы')
  XLSX.utils.book_append_sheet(workbook, productsWorksheet, 'Товары')
  XLSX.utils.book_append_sheet(workbook, clientsWorksheet, 'Клиенты')
  const now = new Date()
  const parts = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(now)
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const timestamp = `${getPart('year')}-${getPart('month')}-${getPart('day')}_${getPart('hour')}-${getPart('minute')}-${getPart('second')}`
  XLSX.writeFile(workbook, `orders-report-${timestamp}.xlsx`)
}
