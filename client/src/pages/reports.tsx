import { useEffect, useState } from 'react'
import { reportsApi, type OrdersReportResponse, type OverdueReportResponse } from '../services/reports'
import { type OrderStatus } from '../services/types'
import { useAuth } from '../utils/auth'
import { useMinLoading } from '../hooks/use-min-loading'
import { AppDateRangePicker } from '../components/date-range-picker'
import { RetryPanel } from '../components/retry-panel'
import { Link } from 'react-router-dom'
import { exportOrdersReport } from '../utils/export-orders-report'

export default function ReportsPage() {
  const { isAuthenticated, initialized, role } = useAuth()
  const [data, setData] = useState<OrdersReportResponse | null>(null)
  const [overdue, setOverdue] = useState<OverdueReportResponse | null>(null)
  const { loading, startLoading, stopLoading } = useMinLoading()
  const [error, setError] = useState<string | null>(null)
  const canReadReports = role === 'admin' || role === 'manager' || role === 'analyst'

  if (!canReadReports) {
    return (
      <div className="card">
        <div className="empty-state">Недостаточно прав для просмотра отчетов</div>
      </div>
    )
  }
  const [filters, setFilters] = useState<{ groupBy: 'status' | 'manager' | 'day', dateFrom: string, dateTo: string, status: OrderStatus | '', managerId: string }>({ groupBy: 'status', dateFrom: '', dateTo: '', status: '', managerId: '' })
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [overdueDays, setOverdueDays] = useState('7')
  const [overduePage, setOverduePage] = useState(1)
  const overduePageSize = 20
  const [reloadKey, setReloadKey] = useState(0)
  const overdueDaysNumber = Number(overdueDays)
  const appliedOverdueDays = Number.isFinite(overdueDaysNumber) && overdueDaysNumber > 0 ? overdueDaysNumber : (overdue?.days ?? 7)
  const thresholdDate = new Date(Date.now() - appliedOverdueDays * 24 * 60 * 60 * 1000)

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

  const handleExport = async () => {
    setError(null)
    startLoading()
    try {
      await exportOrdersReport({
        groupBy: filters.groupBy,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        status: filters.status || undefined,
        managerId: filters.managerId || undefined
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      stopLoading()
    }
  }

  useEffect(() => {
    if (!initialized || !isAuthenticated) return
    startLoading()
    const daysValue = Number(overdueDays)
    Promise.all([
      reportsApi.orders({
        groupBy: filters.groupBy,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        status: filters.status || undefined,
        managerId: filters.managerId || undefined
      }),
      reportsApi.overdue({
        page: overduePage,
        pageSize: overduePageSize,
        days: Number.isFinite(daysValue) && daysValue > 0 ? daysValue : 7,
        status: filters.status || undefined,
        managerId: filters.managerId || undefined
      })
    ])
      .then(([ordersRes, overdueRes]) => {
        setData(ordersRes)
        setOverdue(overdueRes)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => stopLoading())
  }, [initialized, isAuthenticated, filters, overdueDays, overduePage, overduePageSize, reloadKey])

  const handleRetry = () => {
    setError(null)
    setReloadKey((prev) => prev + 1)
  }

  const filteredData = data?.data.filter((row) => row.count > 0) ?? []
  
  const totalPages = Math.max(1, Math.ceil((filteredData.length ?? 0) / pageSize))
  const overdueTotalPages = Math.max(1, Math.ceil((overdue?.total ?? 0) / overduePageSize))
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3>Отчеты по заказам</h3>
          <button className="btn secondary" type="button" onClick={handleExport} disabled={loading}>Экспорт</button>
        </div>
      <div className="grid" style={{ gap: 8, gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 12 }}>
        <select className="input" value={filters.groupBy} onChange={(e) => { setFilters((f) => ({ ...f, groupBy: e.target.value as any })); setPage(1) }}>
          <option value="status">По статусам</option>
          <option value="manager">По менеджерам</option>
          <option value="day">По дням</option>
        </select>
        <select className="input" value={filters.status} onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value as OrderStatus | '' })); setPage(1) }}>
          <option value="">Статус</option>
          {orderStatuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <input className="input" placeholder="Ответственный (ID)" value={filters.managerId} onChange={(e) => { setFilters((f) => ({ ...f, managerId: e.target.value })); setPage(1) }} />
        <AppDateRangePicker
          from={filters.dateFrom}
          to={filters.dateTo}
          onChange={(from, to) => { setFilters((f) => ({ ...f, dateFrom: from, dateTo: to })); setPage(1) }}
          placeholder="Период"
        />
      </div>
      {loading && (
        <div className="skeleton">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      )}
      {error && <RetryPanel message={error} onRetry={handleRetry} />}
      {!loading && !error && data && (
        <>
          {pagedData.length === 0 ? (
            <div className="empty-state">Нет данных</div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ключ</th>
                      <th>Кол-во</th>
                      <th>Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedData.map((row) => (
                      <tr key={row.key}>
                        <td>{data?.groupBy === 'status' ? statusLabel(row.key as OrderStatus) : row.key}</td>
                        <td>{row.count}</td>
                        <td>{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="table-mobile">
                {pagedData.map((row) => (
                  <div key={row.key} className="table-mobile-card">
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Ключ</div>
                      <div className="table-mobile-value">{data?.groupBy === 'status' ? statusLabel(row.key as OrderStatus) : row.key}</div>
                    </div>
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Кол-во</div>
                      <div className="table-mobile-value">{row.count}</div>
                    </div>
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Сумма</div>
                      <div className="table-mobile-value">{row.total}</div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  {page > 1 ? (
                    <button className="btn secondary" type="button" onClick={() => setPage((p) => Math.max(1, p - 1))}>Назад</button>
                  ) : (
                    <span />
                  )}
                  <span style={{ color: '#64748b' }}>{page} / {totalPages}</span>
                  {page < totalPages ? (
                    <button className="btn secondary" type="button" onClick={() => setPage((p) => p + 1)}>Вперед</button>
                  ) : (
                    <span />
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3>Просроченные заказы</h3>
        </div>
        <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12 }}>Показываем заказы в статусах Новый/В обработке старше указанного числа дней</div>
        <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12 }}>Порог: {appliedOverdueDays} дней (созданы до {thresholdDate.toLocaleDateString()})</div>
        <div className="grid" style={{ gap: 8, gridTemplateColumns: '2fr 1fr', marginBottom: 12 }}>
          <input className="input" type="number" min="1" placeholder="Порог, дней с момента создания заказа" value={overdueDays} onChange={(e) => { setOverdueDays(e.target.value); setOverduePage(1) }} />
        </div>
        {loading && (
          <div className="skeleton">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        )}
        {error && <RetryPanel message={error} onRetry={handleRetry} />}
        {!loading && !error && overdue && (
          <>
            {overdue.data.length === 0 ? (
              <div className="empty-state">Нет заказов старше {appliedOverdueDays} дней</div>
            ) : (
              <>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Клиент</th>
                        <th>Статус</th>
                        <th>Сумма</th>
                        <th>Создан</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overdue.data.map((row) => (
                        <tr key={row.id}>
                          <td><Link to={`/orders/${row.id}`}>{row.id}</Link></td>
                          <td>{row.clientName ?? row.clientId}</td>
                          <td><span className={statusClass(row.status)}>{statusLabel(row.status)}</span></td>
                          <td>{row.total}</td>
                          <td>{new Date(row.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="table-mobile">
                  {overdue.data.map((row) => (
                    <div key={row.id} className="table-mobile-card">
                      <div className="table-mobile-row">
                        <div className="table-mobile-label">ID</div>
                        <div className="table-mobile-value"><Link to={`/orders/${row.id}`}>{row.id}</Link></div>
                      </div>
                      <div className="table-mobile-row">
                        <div className="table-mobile-label">Клиент</div>
                        <div className="table-mobile-value">{row.clientName ?? row.clientId}</div>
                      </div>
                      <div className="table-mobile-row">
                        <div className="table-mobile-label">Статус</div>
                        <div className="table-mobile-value"><span className={statusClass(row.status)}>{statusLabel(row.status)}</span></div>
                      </div>
                      <div className="table-mobile-row">
                        <div className="table-mobile-label">Сумма</div>
                        <div className="table-mobile-value">{row.total}</div>
                      </div>
                      <div className="table-mobile-row">
                        <div className="table-mobile-label">Создан</div>
                        <div className="table-mobile-value">{new Date(row.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {overdueTotalPages > 1 && (
                  <div className="pagination">
                    {overduePage > 1 ? (
                      <button className="btn secondary" type="button" onClick={() => setOverduePage((p) => Math.max(1, p - 1))}>Назад</button>
                    ) : (
                      <span />
                    )}
                    <span style={{ color: '#64748b' }}>{overduePage} / {overdueTotalPages}</span>
                    {overduePage < overdueTotalPages ? (
                      <button className="btn secondary" type="button" onClick={() => setOverduePage((p) => p + 1)}>Вперед</button>
                    ) : (
                      <span />
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
