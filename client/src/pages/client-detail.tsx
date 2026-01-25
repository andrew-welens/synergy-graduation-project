import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../utils/auth'
import { clientsApi } from '../services/clients'
import { ordersApi } from '../services/orders'
import { interactionsApi } from '../services/interactions'
import { type Client, type Order, type Interaction, type Product, type OrderStatus } from '../services/types'
import { catalogApi } from '../services/catalog'
import { useMinLoading } from '../hooks/use-min-loading'
import { AppDateRangePicker } from '../components/date-range-picker'
import { RetryPanel } from '../components/retry-panel'
import { useCopyToClipboard } from '../utils/clipboard'
import { SkeletonCard } from '../components/skeleton-card'
import { Pagination } from '../components/pagination'

export default function ClientDetailPage() {
  const { clientId } = useParams()
  const { isAuthenticated, initialized, role } = useAuth()
  const [client, setClient] = useState<Client | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const { loading, startLoading, stopLoading } = useMinLoading()
  const [error, setError] = useState<string | null>(null)
  const [ordersTotal, setOrdersTotal] = useState(0)
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersPageSize, setOrdersPageSize] = useState(20)
  const [ordersFilters, setOrdersFilters] = useState<{ status: OrderStatus | '', dateFrom: string, dateTo: string }>({ status: '', dateFrom: '', dateTo: '' })
  const ordersTotalPages = Math.max(1, Math.ceil(ordersTotal / ordersPageSize))
  const [activeTab, setActiveTab] = useState<'data' | 'orders' | 'interactions'>('data')
  const [reloadKey, setReloadKey] = useState(0)

  const orderStatuses: { value: OrderStatus, label: string }[] = [
    { value: 'new', label: 'Новый' },
    { value: 'in_progress', label: 'В обработке' },
    { value: 'done', label: 'Выполнен' },
    { value: 'canceled', label: 'Отменен' }
  ]

  const canReadCatalog = role === 'admin' || role === 'manager' || role === 'operator'
  const canWriteOrders = role === 'admin' || role === 'manager' || role === 'operator'
  const canWriteInteractions = role === 'admin' || role === 'manager' || role === 'operator'
  const copyToClipboard = useCopyToClipboard()

  const formatCurrency = (value: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value)
  const overdueDays = 7
  const overdueThreshold = Date.now() - overdueDays * 24 * 60 * 60 * 1000
  const criticalDays = 14
  const criticalThreshold = Date.now() - criticalDays * 24 * 60 * 60 * 1000
  const isOrderOverdue = (order: Order) => {
    if (order.status === 'done' || order.status === 'canceled') return false
    const createdAt = new Date(order.createdAt).getTime()
    return Number.isFinite(createdAt) && createdAt < overdueThreshold
  }
  const isOrderCritical = (order: Order) => {
    if (order.status === 'done' || order.status === 'canceled') return false
    const createdAt = new Date(order.createdAt).getTime()
    return Number.isFinite(createdAt) && createdAt < criticalThreshold
  }

  useEffect(() => {
    if (!clientId || !initialized || !isAuthenticated) return
    startLoading()
    Promise.all([
      clientsApi.get(clientId),
      ordersApi.list({
        clientId,
        page: ordersPage,
        pageSize: ordersPageSize,
        status: ordersFilters.status || undefined,
        dateFrom: ordersFilters.dateFrom || undefined,
        dateTo: ordersFilters.dateTo || undefined
      }),
      interactionsApi.list(clientId, { page: 1, pageSize: 50 })
    ])
      .then(async ([c, o, inter]) => {
        setClient(c)
        setOrders(o.data)
        setOrdersTotal(o.total)
        setInteractions(inter.data)
        if (canReadCatalog) {
          const prods = await catalogApi.products({ page: 1, pageSize: 200 })
          setProducts(prods.data)
        } else {
          setProducts([])
        }
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => stopLoading())
  }, [clientId, initialized, isAuthenticated, ordersPage, ordersPageSize, ordersFilters, canReadCatalog, reloadKey])

  const handleRetry = () => {
    setError(null)
    setReloadKey((prev) => prev + 1)
  }

  if (!clientId) return <div className="page">Клиент не найден</div>

  const statusLabel = (status: OrderStatus) => orderStatuses.find((s) => s.value === status)?.label ?? status
  const statusClass = (status: OrderStatus) => {
    if (status === 'new') return 'badge new'
    if (status === 'in_progress') return 'badge in-progress'
    if (status === 'done') return 'badge done'
    if (status === 'canceled') return 'badge canceled'
    return 'badge'
  }

  const orderFilterChips = useMemo(() => {
    const chips: { key: string, label: string, onClear: () => void }[] = []
    if (ordersFilters.status) {
      const label = orderStatuses.find((s) => s.value === ordersFilters.status)?.label ?? ordersFilters.status
      chips.push({ key: 'status', label: `Статус: ${label}`, onClear: () => { setOrdersFilters((f) => ({ ...f, status: '' })); setOrdersPage(1) } })
    }
    if (ordersFilters.dateFrom || ordersFilters.dateTo) {
      const label = `${ordersFilters.dateFrom || '...'} — ${ordersFilters.dateTo || '...'}`
      chips.push({ key: 'period', label: `Период: ${label}`, onClear: () => { setOrdersFilters((f) => ({ ...f, dateFrom: '', dateTo: '' })); setOrdersPage(1) } })
    }
    return chips
  }, [ordersFilters, orderStatuses])

  const hasOrderFilters = orderFilterChips.length > 0

  const resetOrderFilters = () => {
    setOrdersFilters({ status: '', dateFrom: '', dateTo: '' })
    setOrdersPage(1)
  }

  return (
    <div className="page grid" style={{ gap: 16 }}>
      {loading && <SkeletonCard lines={3} />}
      {error && <RetryPanel message={error} onRetry={handleRetry} />}

      <div className="card">
        <div className="toolbar" style={{ marginBottom: 16 }}>
          <div className="toolbar-title">
            <h3>{client?.name ?? clientId}</h3>
          </div>
          <div className="toolbar-actions">
            <Link className="btn secondary" to="/clients">К списку</Link>
            {canWriteInteractions && <Link className="btn secondary" to={`/clients/${clientId}/interactions`}>Взаимодействия</Link>}
            {canWriteOrders && <Link className="btn" to={`/orders?clientId=${clientId}`}>Создать заказ</Link>}
          </div>
        </div>
        <div className="tabs" style={{ marginBottom: 20 }}>
          <button className={`tab${activeTab === 'data' ? ' active' : ''}`} type="button" onClick={() => setActiveTab('data')}>
            Данные
          </button>
          <button className={`tab${activeTab === 'orders' ? ' active' : ''}`} type="button" onClick={() => setActiveTab('orders')}>
            Заказы
          </button>
          <button className={`tab${activeTab === 'interactions' ? ' active' : ''}`} type="button" onClick={() => setActiveTab('interactions')}>
            Взаимодействия
          </button>
        </div>

        {activeTab === 'data' && client && (
          <div className="grid" style={{ gap: 20 }}>
            <div>
              <h4 style={{ marginBottom: 16, color: '#f8fafc' }}>Основная информация</h4>
                <div className="grid" style={{ gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Полное имя</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: 16 }}>{client.name}</strong>
                      <button
                        className="btn secondary"
                        type="button"
                        onClick={() => copyToClipboard(client.name, 'Имя клиента')}
                        style={{ padding: '4px 8px', fontSize: 12 }}
                      >
                        Копировать
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Тип клиента</div>
                    <div>
                      <span className="badge">{client.type === 'legal' ? 'Юридическое лицо' : 'Физическое лицо'}</span>
                    </div>
                  </div>
                  {client.inn && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>ИНН</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{client.inn}</span>
                        <button
                          className="btn secondary"
                          type="button"
                          onClick={() => copyToClipboard(client.inn!, 'ИНН')}
                          style={{ padding: '4px 8px', fontSize: 12 }}
                        >
                          Копировать
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: 16, color: '#f8fafc' }}>Контактная информация</h4>
                <div className="grid" style={{ gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                  {client.email && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <a href={`mailto:${client.email}`} style={{ color: '#cbd5f5', textDecoration: 'none' }}>{client.email}</a>
                        <button
                          className="btn secondary"
                          type="button"
                          onClick={() => copyToClipboard(client.email!, 'Email')}
                          style={{ padding: '4px 8px', fontSize: 12 }}
                        >
                          Копировать
                        </button>
                      </div>
                    </div>
                  )}
                  {client.phone && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Телефон</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <a href={`tel:${client.phone}`} style={{ color: '#cbd5f5', textDecoration: 'none' }}>{client.phone}</a>
                        <button
                          className="btn secondary"
                          type="button"
                          onClick={() => copyToClipboard(client.phone!, 'Телефон')}
                          style={{ padding: '4px 8px', fontSize: 12 }}
                        >
                          Копировать
                        </button>
                      </div>
                    </div>
                  )}
                  {(client.city || client.address) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Адрес</div>
                      <div>
                        {client.city && <span>{client.city}</span>}
                        {client.city && client.address && <span>, </span>}
                        {client.address && <span>{client.address}</span>}
                        {!client.city && !client.address && <span className="text-muted">Не указан</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: 16, color: '#f8fafc' }}>Теги и метки</h4>
                <div className="chips">
                  {(client.tags ?? []).length === 0 ? (
                    <span className="text-muted">Теги не указаны</span>
                  ) : (
                    client.tags?.map((tag) => (
                      <div key={tag} className="chip">
                        <span>{tag}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: 16, color: '#f8fafc' }}>Статистика</h4>
                <div className="grid" style={{ gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'rgba(148, 163, 184, 0.08)', borderRadius: 12 }}>
                    <div className="text-muted" style={{ fontSize: 12 }}>Всего заказов</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc' }}>{client.ordersCount ?? 0}</div>
                  </div>
                </div>
              </div>
            </div>
        )}

        {activeTab === 'orders' && (
          <>
            <div className="toolbar" style={{ marginBottom: 12 }}>
              <div className="toolbar-title">
                <h4>Заказы</h4>
                <span className="toolbar-meta">{ordersTotal}</span>
              </div>
              <div className="toolbar-actions">
                {hasOrderFilters && <button className="btn secondary" type="button" onClick={resetOrderFilters}>Сбросить фильтры</button>}
              </div>
            </div>
            <div className="filters-row" style={{ marginBottom: 8 }}>
          <select className="input" value={ordersFilters.status} onChange={(e) => { setOrdersFilters((f) => ({ ...f, status: e.target.value as OrderStatus | '' })); setOrdersPage(1) }}>
            <option value="">Статус</option>
            {orderStatuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <AppDateRangePicker
            from={ordersFilters.dateFrom}
            to={ordersFilters.dateTo}
            onChange={(from, to) => { setOrdersFilters((f) => ({ ...f, dateFrom: from, dateTo: to })); setOrdersPage(1) }}
            placeholder="Период"
          />
        </div>
        {orderFilterChips.length > 0 && (
          <div className="chips" style={{ marginBottom: 12 }}>
            {orderFilterChips.map((chip) => (
              <div key={chip.key} className="chip">
                <span>{chip.label}</span>
                <button type="button" onClick={chip.onClear}>×</button>
              </div>
            ))}
          </div>
        )}
        {orders.length === 0 ? (
          <div className="empty-state">
            <div>{hasOrderFilters ? 'Ничего не найдено' : 'Нет заказов'}</div>
            {hasOrderFilters && <button className="btn secondary" type="button" onClick={resetOrderFilters}>Сбросить фильтры</button>}
            {!hasOrderFilters && canWriteOrders && <Link className="btn secondary" to={`/orders?clientId=${clientId}`}>Создать заказ</Link>}
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Статус</th>
                    <th className="text-right">Сумма</th>
                    <th>Позиции</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const isOverdue = isOrderOverdue(o)
                    const isCritical = isOrderCritical(o)
                    const rowClass = isCritical ? 'is-critical' : isOverdue ? 'is-overdue' : undefined
                    return (
                    <tr key={o.id} className={rowClass}>
                      <td><Link to={`/orders/${o.id}`}>{o.id}</Link></td>
                      <td>
                        <span className={statusClass(o.status)}>{statusLabel(o.status)}</span>
                        {isOverdue && <span className="badge danger overdue-badge">Просрочен</span>}
                        {isCritical && <span className="badge critical overdue-badge">Критичный</span>}
                      </td>
                      <td className="text-right">{formatCurrency(o.totalAmount ?? o.total)}</td>
                      <td>
                        {o.items?.map((i, idx) => {
                          const prodName = products.find((p) => p.id === i.productId)?.name ?? i.productId
                          return <div key={idx}>{prodName} x{i.quantity}</div>
                        })}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
            {ordersTotal > 0 && (
              <Pagination
                page={ordersPage}
                totalPages={ordersTotalPages}
                total={ordersTotal}
                pageSize={ordersPageSize}
                onPageChange={setOrdersPage}
                onPageSizeChange={setOrdersPageSize}
              />
            )}
          </>
        )}
          </>
        )}

        {activeTab === 'interactions' && (
          <>
            <div className="toolbar" style={{ marginBottom: 12 }}>
              <div className="toolbar-title">
                <h4>Взаимодействия</h4>
                <span className="toolbar-meta">{interactions.length}</span>
              </div>
              <div className="toolbar-actions">
                {canWriteInteractions && <Link className="btn secondary" to={`/clients/${clientId}/interactions`}>Добавить</Link>}
              </div>
            </div>
            {interactions.length === 0 ? (
          <div className="empty-state">
            <div>Нет взаимодействий</div>
            {canWriteInteractions && <Link className="btn secondary" to={`/clients/${clientId}/interactions`}>Добавить взаимодействие</Link>}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Канал</th>
                  <th>Описание</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {interactions.map((i) => (
                  <tr key={i.id}>
                    <td>{i.channel}</td>
                    <td>{i.description}</td>
                    <td>{new Date(i.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}
