import { useEffect, useMemo, useState } from 'react'
import { ordersApi } from '../api/orders'
import { type Order, type Client, type Product, type OrderStatus, type User } from '../api/types'
import { useAuth } from '../state/auth'
import { clientsApi } from '../api/clients'
import { catalogApi } from '../api/catalog'
import { Link, useLocation } from 'react-router-dom'
import { useMinLoading } from '../hooks/use-min-loading'
import { AppDateRangePicker } from '../components/date-range-picker'
import { useToast } from '../state/toast'
import { usersApi } from '../api/users'

export default function OrdersPage() {
  const { isAuthenticated, initialized, role } = useAuth()
  const [data, setData] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const { loading, startLoading, stopLoading } = useMinLoading()
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [form, setForm] = useState<{ clientId: string, productId: string, qty: string, comments: string }>({ clientId: '', productId: '', qty: '1', comments: '' })
  const [filters, setFilters] = useState<{ status: OrderStatus | '', managerId: string, dateFrom: string, dateTo: string }>({ status: '', managerId: '', dateFrom: '', dateTo: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'status' | 'total' | 'createdAt'>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const addToast = useToast((state) => state.add)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const location = useLocation()

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
  const overdueDays = 7
  const overdueThreshold = Date.now() - overdueDays * 24 * 60 * 60 * 1000
  const isOrderOverdue = (order: Order) => {
    if (order.status === 'done' || order.status === 'canceled') return false
    const createdAt = new Date(order.createdAt).getTime()
    return Number.isFinite(createdAt) && createdAt < overdueThreshold
  }

  const canWrite = role === 'admin' || role === 'manager' || role === 'operator'
  const canReadCatalog = role === 'admin' || role === 'manager' || role === 'operator'
  const createQuantity = Number(form.qty)
  const isCreateValid = Boolean(form.clientId) && Boolean(form.productId) && Number.isFinite(createQuantity) && createQuantity > 0
  const createDisabledReason = !form.clientId
    ? 'Выберите клиента'
    : !form.productId
      ? 'Выберите товар'
      : !Number.isFinite(createQuantity) || createQuantity <= 0
        ? 'Укажите количество больше 0'
        : ''

  const managerOptions = useMemo(() => users.filter((u) => ['admin', 'manager', 'operator'].includes(u.role)), [users])

  const filterChips = useMemo(() => {
    const chips: { key: string, label: string, onClear: () => void }[] = []
    if (filters.status) {
      const label = orderStatuses.find((s) => s.value === filters.status)?.label ?? filters.status
      chips.push({ key: 'status', label: `Статус: ${label}`, onClear: () => { setFilters((f) => ({ ...f, status: '' })); setPage(1) } })
    }
    if (filters.managerId) {
      const managerLabel = managerOptions.find((u) => u.id === filters.managerId)?.email ?? filters.managerId
      chips.push({ key: 'manager', label: `Ответственный: ${managerLabel}`, onClear: () => { setFilters((f) => ({ ...f, managerId: '' })); setPage(1) } })
    }
    if (filters.dateFrom || filters.dateTo) {
      const label = `${filters.dateFrom || '...'} — ${filters.dateTo || '...'}`
      chips.push({ key: 'period', label: `Период: ${label}`, onClear: () => { setFilters((f) => ({ ...f, dateFrom: '', dateTo: '' })); setPage(1) } })
    }
    return chips
  }, [filters, managerOptions, orderStatuses])

  const hasActiveFilters = filterChips.length > 0

  const resetFilters = () => {
    setFilters({ status: '', managerId: '', dateFrom: '', dateTo: '' })
    setPage(1)
  }

  const openCreateForm = () => {
    setIsFormOpen(true)
    setFieldErrors({})
    setFormError(null)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setFormError(null)
    setFieldErrors({})
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const clientIdParam = params.get('clientId')
    if (clientIdParam) {
      setForm((prev) => ({ ...prev, clientId: clientIdParam }))
      setIsFormOpen(true)
    }
  }, [location.search])

  useEffect(() => {
    if (!initialized || !isAuthenticated) return
    startLoading()
    Promise.all([
      ordersApi.list({
        page,
        pageSize,
        status: filters.status || undefined,
        managerId: filters.managerId || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        sortBy,
        sortDir
      }),
      clientsApi.list({ page: 1, pageSize: 100 }),
      usersApi.list()
    ])
      .then(async ([ordersRes, clientsRes, usersRes]) => {
        setData(ordersRes.data)
        setTotal(ordersRes.total)
        setClients(clientsRes.data)
        setUsers(usersRes)
        if (canReadCatalog) {
          const productsRes = await catalogApi.products({ page: 1, pageSize: 100 })
          setProducts(productsRes.data)
        } else {
          setProducts([])
        }
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => stopLoading())
  }, [initialized, isAuthenticated, page, pageSize, filters, canReadCatalog, sortBy, sortDir])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFormError(null)
    const errors: Record<string, string> = {}
    const quantity = Number(form.qty)
    if (!form.clientId) errors.clientId = 'Выберите клиента'
    if (!form.productId) errors.productId = 'Выберите товар'
    if (!Number.isFinite(quantity) || quantity < 1) errors.qty = 'Укажите количество больше 0'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    startLoading()
    try {
      const product = products.find((p) => p.id === form.productId)
      if (!product) throw new Error('Товар не найден')
      const created = await ordersApi.create({
        clientId: form.clientId,
        items: [{ productId: product.id, quantity, price: product.price }],
        status: 'new',
        comments: form.comments.trim() || undefined
      })
      setData((prev) => [created, ...prev])
      setTotal((prev) => prev + 1)
      setForm({ clientId: '', productId: '', qty: '1', comments: '' })
      setFieldErrors({})
      setIsFormOpen(false)
      addToast({ type: 'success', title: 'Заказ создан', description: `ID ${created.id}` })
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      stopLoading()
    }
  }

  return (
    <div className="card">
      <div className="toolbar" style={{ marginBottom: 12 }}>
        <div className="toolbar-title">
          <h3>Заказы</h3>
          <span className="toolbar-meta">{total} записей</span>
        </div>
        <div className="toolbar-actions">
          {canWrite && <button className="btn" type="button" onClick={openCreateForm}>Создать</button>}
        </div>
      </div>
      <div className="filters-row" style={{ marginBottom: 8 }}>
        <select className="input" value={filters.status} onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value as OrderStatus | '' })); setPage(1) }}>
          <option value="">Статус</option>
          {orderStatuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select className="input" value={filters.managerId} onChange={(e) => { setFilters((f) => ({ ...f, managerId: e.target.value })); setPage(1) }}>
          <option value="">Ответственный</option>
          {managerOptions.map((u) => (
            <option key={u.id} value={u.id}>{u.email}</option>
          ))}
        </select>
        <AppDateRangePicker
          from={filters.dateFrom}
          to={filters.dateTo}
          onChange={(from, to) => { setFilters((f) => ({ ...f, dateFrom: from, dateTo: to })); setPage(1) }}
          placeholder="Период"
        />
        <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'status' | 'total' | 'createdAt')}>
          <option value="createdAt">Сортировка: дата</option>
          <option value="status">Сортировка: статус</option>
          <option value="total">Сортировка: сумма</option>
        </select>
        <button className="btn secondary" type="button" onClick={() => setSortDir((prev) => prev === 'asc' ? 'desc' : 'asc')}>
          {sortDir === 'asc' ? 'По возр.' : 'По убыв.'}
        </button>
        {hasActiveFilters && <button className="btn secondary" type="button" onClick={resetFilters}>Сбросить фильтры</button>}
      </div>
      {filterChips.length > 0 && (
        <div className="chips" style={{ marginBottom: 12 }}>
          {filterChips.map((chip) => (
            <div key={chip.key} className="chip">
              <span>{chip.label}</span>
              <button type="button" onClick={chip.onClear}>×</button>
            </div>
          ))}
        </div>
      )}
      {loading && (
        <div className="skeleton">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      )}
      {error && <div className="form-error">{error}</div>}
      {!loading && !error && (
        <>
          {data.length === 0 ? (
            <div className="empty-state">
              <div>{hasActiveFilters ? 'Ничего не найдено' : 'Заказов пока нет'}</div>
              {hasActiveFilters && <button className="btn secondary" type="button" onClick={resetFilters}>Сбросить фильтры</button>}
              {!hasActiveFilters && canWrite && <button className="btn secondary" type="button" onClick={openCreateForm}>Создать заказ</button>}
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Клиент</th>
                    <th>Статус</th>
                    <th className="text-right">Сумма</th>
                    <th>Позиции</th>
                    <th>Комментарий</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((o) => {
                    const isOverdue = isOrderOverdue(o)
                    return (
                    <tr key={o.id} className={isOverdue ? 'is-overdue' : undefined}>
                      <td><Link to={`/orders/${o.id}`}>{o.id}</Link></td>
                      <td>{o.clientName ?? clients.find((c) => c.id === o.clientId)?.name ?? o.clientId}</td>
                      <td>
                        <span className={statusClass(o.status)}>{statusLabel(o.status)}</span>
                        {isOverdue && <span className="badge danger overdue-badge">Просрочен</span>}
                      </td>
                      <td className="text-right">{formatCurrency(o.totalAmount ?? o.total)}</td>
                      <td>
                        {o.items?.map((i, idx) => {
                          const prodName = products.find((p) => p.id === i.productId)?.name ?? i.productId
                          return <div key={idx}>{prodName} x{i.quantity}</div>
                        })}
                      </td>
                      <td>{o.comments ?? '—'}</td>
                      <td>
                        <Link className="btn secondary" to={`/orders/${o.id}`}>Открыть</Link>
                      </td>
                    </tr>
                  )})}
                </tbody>
                </table>
              </div>
              {total > 0 && (
                <div className="pagination">
                  <span className="text-muted">
                    {total === 0 ? '0' : `${(page - 1) * pageSize + 1}–${Math.min(total, page * pageSize)} из ${total}`}
                  </span>
                  <div className="actions-row">
                    <button className="btn secondary" type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Назад</button>
                    <span className="text-muted">{page} / {totalPages}</span>
                    <button className="btn secondary" type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Вперед</button>
                  </div>
                  <select className="input" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}>
                    <option value={10}>10 / стр</option>
                    <option value={20}>20 / стр</option>
                    <option value={50}>50 / стр</option>
                  </select>
                </div>
              )}
            </>
          )}
        </>
      )}
      {isFormOpen && (
        <>
          <button className="drawer-backdrop" type="button" aria-label="Закрыть форму" onClick={closeForm} />
          <div className="drawer">
            <div className="drawer-header">
              <div className="drawer-title">Новый заказ</div>
              <button className="btn secondary" type="button" onClick={closeForm}>Закрыть</button>
            </div>
            <form className="grid" style={{ gap: 8 }} onSubmit={handleCreate}>
              <div>
                <select className="input" required value={form.clientId} onChange={(e) => { setForm((f) => ({ ...f, clientId: e.target.value })); setFieldErrors((prev) => ({ ...prev, clientId: '' })) }}>
                  <option value="">Клиент</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {fieldErrors.clientId && <div className="form-error">{fieldErrors.clientId}</div>}
              </div>
              <div>
                <select className="input" required value={form.productId} onChange={(e) => { setForm((f) => ({ ...f, productId: e.target.value })); setFieldErrors((prev) => ({ ...prev, productId: '' })) }}>
                  <option value="">Товар</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)})</option>)}
                </select>
                {fieldErrors.productId && <div className="form-error">{fieldErrors.productId}</div>}
              </div>
              <div>
                <input className="input" type="number" min="1" required value={form.qty} onChange={(e) => { setForm((f) => ({ ...f, qty: e.target.value })); setFieldErrors((prev) => ({ ...prev, qty: '' })) }} />
                {fieldErrors.qty && <div className="form-error">{fieldErrors.qty}</div>}
              </div>
              <div>
                <input className="input" placeholder="Комментарий" value={form.comments} onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))} />
              </div>
              <span title={!isCreateValid ? createDisabledReason : undefined} style={{ display: 'inline-block' }}>
                <button className="btn" type="submit" disabled={loading || !isCreateValid}>Создать</button>
              </span>
              <button className="btn secondary" type="button" onClick={closeForm}>Отмена</button>
              {formError && <div className="form-error">{formError}</div>}
            </form>
          </div>
        </>
      )}
    </div>
  )
}
