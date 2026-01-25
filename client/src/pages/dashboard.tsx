import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clientsApi } from '../services/clients'
import { ordersApi } from '../services/orders'
import { catalogApi } from '../services/catalog'
import { reportsApi } from '../services/reports'
import * as XLSX from 'xlsx'
import { useAuth } from '../utils/auth'
import { type Client, type Order, type OrderStatus } from '../services/types'
import { useMinLoading } from '../hooks/use-min-loading'

export default function DashboardPage() {
  const { isAuthenticated, initialized, role } = useAuth()
  const navigate = useNavigate()
  const { loading, startLoading, stopLoading } = useMinLoading()
  const [error, setError] = useState<string | null>(null)
  const [counts, setCounts] = useState({ clients: 0, orders: 0, products: 0 })
  const [trend, setTrend] = useState<number[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [recentClients, setRecentClients] = useState<Client[]>([])
  const trendMax = useMemo(() => Math.max(1, ...trend), [trend])
  const trendLabels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

  const orderStatuses: { value: OrderStatus, label: string }[] = [
    { value: 'new', label: 'Новый' },
    { value: 'in_progress', label: 'В обработке' },
    { value: 'done', label: 'Выполнен' },
    { value: 'canceled', label: 'Отменен' }
  ]

  const statusLabel = (status: OrderStatus) => orderStatuses.find((s) => s.value === status)?.label ?? status
  const statusClass = (status: OrderStatus) => {
    if (status === 'new') return 'badge new'
    if (status === 'in_progress') return 'badge in-progress'
    if (status === 'done') return 'badge done'
    if (status === 'canceled') return 'badge canceled'
    return 'badge'
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value)

  const canReadCatalog = role === 'admin' || role === 'manager' || role === 'operator'
  const canReadReports = role === 'admin' || role === 'manager' || role === 'analyst'
  const canWriteClients = role === 'admin' || role === 'manager' || role === 'operator'
  const canWriteOrders = role === 'admin' || role === 'manager' || role === 'operator'
  const canWriteCatalog = role === 'admin' || role === 'manager'
  const hasQuickActions = canWriteClients || canWriteOrders || canWriteCatalog

  useEffect(() => {
    if (!initialized || !isAuthenticated) return
    startLoading()
    Promise.all([
      clientsApi.list({ page: 1, pageSize: 50 }),
      ordersApi.list({ page: 1, pageSize: 5 })
    ])
      .then(async ([clientsRes, ordersRes]) => {
        const productsTotal = canReadCatalog
          ? (await catalogApi.products({ page: 1, pageSize: 1 })).total
          : 0
        setCounts({ clients: clientsRes.total, orders: ordersRes.total, products: productsTotal })
        setRecentOrders(ordersRes.data)
        setRecentClients(clientsRes.data)
        setTrend([12, 28, 18, 35, 22, 48, 30, 52, 36, 60, 44, 72])
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => stopLoading())
  }, [initialized, isAuthenticated, canReadCatalog])

  const handleExport = async () => {
    if (!canReadReports) return
    setError(null)
    startLoading()
    try {
      const report = await reportsApi.orders({ groupBy: 'status' })
      const groupLabel = report.groupBy === 'manager' ? 'Менеджер' : report.groupBy === 'day' ? 'Дата' : 'Статус'
      const header = [groupLabel, 'Количество', 'Сумма']
      const rows = report.data.map((row) => [row.key, row.count, row.total])
      const sheetData = [header, ...rows]
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData)
      worksheet['!cols'] = [{ wch: 24 }, { wch: 14 }, { wch: 16 }]
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Отчет')
      const datePart = new Date().toISOString().slice(0, 10)
      XLSX.writeFile(workbook, `orders-report-${datePart}.xlsx`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      stopLoading()
    }
  }

  const handleCreateReport = () => {
    if (canReadReports) {
      navigate('/reports')
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Сводка</h3>
            <div className="topbar-subtitle">Показатели за последние 30 дней</div>
          </div>
          {canReadReports && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn secondary" type="button" onClick={handleExport} disabled={loading}>Экспорт</button>
              <button className="btn" type="button" onClick={handleCreateReport}>Создать отчет</button>
            </div>
          )}
        </div>
        {loading && <div>Загрузка...</div>}
        {error && <div style={{ color: '#f87171' }}>{error}</div>}
        {!loading && !error && (
          <div className="grid" style={{ gap: 12, gridTemplateColumns: canReadCatalog ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', marginTop: 16 }}>
            <div className="card stat-card">
              <div className="stat-label">Клиенты</div>
              <div className="stat-value">{counts.clients}</div>
              <div className="stat-meta">+8.2% за месяц</div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Заказы</div>
              <div className="stat-value">{counts.orders}</div>
              <div className="stat-meta">+5.4% за месяц</div>
            </div>
            {canReadCatalog && (
              <div className="card stat-card">
                <div className="stat-label">Товары</div>
                <div className="stat-value">{counts.products}</div>
                <div className="stat-meta">+2.1% за месяц</div>
              </div>
            )}
            <div className="card stat-card">
              <div className="stat-label">Новые заявки</div>
              <div className="stat-value">{Math.round(counts.orders * 0.18)}</div>
              <div className="stat-meta">+12.6% за месяц</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid" style={{ gap: 16, gridTemplateColumns: '2fr 1fr' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Динамика заказов</h3>
            <div className="topbar-subtitle">Янв–Дек</div>
          </div>
          <div className="chart">
            {trend.map((value, index) => (
              <div key={index} className="chart-item">
                <div className="chart-value">{value}K</div>
                <div
                  className="chart-bar"
                  style={{ height: `${Math.round((value / trendMax) * 100)}%` }}
                />
                <div className="chart-label">{trendLabels[index] ?? `M${index + 1}`}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid" style={{ gap: 12 }}>
          <div className="card">
            <div className="stat-label">Доход</div>
            <div className="stat-value">{formatCurrency(Math.round(counts.orders * 1480))}</div>
            <div className="stat-meta">Средний чек {formatCurrency(1480)}</div>
          </div>
          <div className="card">
            <div className="stat-label">Просроченные</div>
            <div className="stat-value">{Math.max(0, Math.round(counts.orders * 0.04))}</div>
            <div className="stat-meta">Контроль SLA</div>
          </div>
          <div className="card">
            <div className="stat-label">Активные менеджеры</div>
            <div className="stat-value">{Math.max(3, Math.round(counts.clients / 10))}</div>
            <div className="stat-meta">Распределение нагрузки</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3>Последние заказы</h3>
          <Link className="btn secondary" to="/orders">Все заказы</Link>
        </div>
        {loading && (
          <div className="skeleton">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        )}
        {!loading && recentOrders.length === 0 && (
          <div className="empty-state">Нет заказов</div>
        )}
        {!loading && recentOrders.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Клиент</th>
                  <th>Статус</th>
                  <th className="text-right">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td><Link to={`/orders/${order.id}`}>{order.id}</Link></td>
                    <td>{order.clientName ?? recentClients.find((c) => c.id === order.clientId)?.name ?? order.clientId}</td>
                    <td><span className={statusClass(order.status)}>{statusLabel(order.status)}</span></td>
                    <td className="text-right">{formatCurrency(order.totalAmount ?? order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hasQuickActions && (
        <div className="card">
          <h3>Быстрые действия</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
            {canWriteClients && <Link className="btn secondary" to="/clients">Добавить клиента</Link>}
            {canWriteOrders && <Link className="btn secondary" to="/orders">Создать заказ</Link>}
            {canWriteCatalog && <Link className="btn secondary" to="/catalog">Добавить товар</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
