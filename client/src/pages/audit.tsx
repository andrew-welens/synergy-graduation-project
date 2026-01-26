import { useEffect, useState } from 'react'
import auditApi, { type AuditEntry } from '../services/audit'
import { useAuth } from '../utils/auth'
import { useMinLoading } from '../hooks/use-min-loading'
import { AppDateRangePicker } from '../components/date-range-picker'
import { RetryPanel } from '../components/retry-panel'
import { SkeletonTable } from '../components/skeleton-table'
import { Pagination } from '../components/pagination'
import { EmptyState } from '../components/empty-state'

export default function AuditPage() {
  const { isAuthenticated, initialized, role } = useAuth()
  const [data, setData] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const { loading, startLoading, stopLoading } = useMinLoading()
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({ entityType: '', dateFrom: '', dateTo: '', userId: '', entityId: '' })
  const [page, setPage] = useState(1)
  const pageSize = 50
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const [reloadKey, setReloadKey] = useState(0)

  const canReadAudit = role === 'admin' || role === 'analyst'

  if (!canReadAudit) {
    return (
      <div className="card">
        <div className="empty-state">Недостаточно прав для просмотра аудита</div>
      </div>
    )
  }

  useEffect(() => {
    if (!initialized || !isAuthenticated) return
    startLoading()
    auditApi.list({
      page,
      pageSize,
      entityType: filters.entityType || undefined,
      entityId: filters.entityId || undefined,
      userId: filters.userId || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined
    })
      .then((res) => {
        setData(res.data)
        setTotal(res.total)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => stopLoading())
  }, [initialized, isAuthenticated, filters, page, pageSize, reloadKey])

  const handleRetry = () => {
    setError(null)
    setReloadKey((prev) => prev + 1)
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3>Аудит</h3>
        <span style={{ color: '#64748b', fontSize: 14 }}>{total}</span>
      </div>
      <div className="grid" style={{ gap: 8, gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 12 }}>
        <input className="input" placeholder="Тип сущности" value={filters.entityType} onChange={(e) => { setFilters((f) => ({ ...f, entityType: e.target.value })); setPage(1) }} />
        <input className="input" placeholder="ID сущности" value={filters.entityId} onChange={(e) => { setFilters((f) => ({ ...f, entityId: e.target.value })); setPage(1) }} />
        <input className="input" placeholder="Пользователь (ID)" value={filters.userId} onChange={(e) => { setFilters((f) => ({ ...f, userId: e.target.value })); setPage(1) }} />
        <AppDateRangePicker
          from={filters.dateFrom}
          to={filters.dateTo}
          onChange={(from, to) => { setFilters((f) => ({ ...f, dateFrom: from, dateTo: to })); setPage(1) }}
          placeholder="Период"
        />
      </div>
      {loading && <SkeletonTable rows={5} cols={5} />}
      {error && <RetryPanel message={error} onRetry={handleRetry} />}
      {!loading && !error && (
        <>
          {data.length === 0 ? (
            <EmptyState
              title="Нет данных"
              description="Записи аудита появятся здесь после выполнения действий в системе"
              icon="no-data"
            />
          ) : (
            <>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Пользователь</th>
                      <th>Действие</th>
                      <th>Сущность</th>
                      <th>Meta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row) => (
                      <tr key={row.id}>
                        <td>{new Date(row.createdAt).toLocaleString()}</td>
                        <td>{row.userId}</td>
                        <td>{row.action}</td>
                        <td>{row.entityType}{row.entityId ? ` #${row.entityId}` : ''}</td>
                        <td>{row.metadata ? JSON.stringify(row.metadata) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="table-mobile">
                {data.map((row) => (
                  <div key={row.id} className="table-mobile-card">
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Дата</div>
                      <div className="table-mobile-value">{new Date(row.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Пользователь</div>
                      <div className="table-mobile-value">{row.userId}</div>
                    </div>
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Действие</div>
                      <div className="table-mobile-value">{row.action}</div>
                    </div>
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Сущность</div>
                      <div className="table-mobile-value">{row.entityType}{row.entityId ? ` #${row.entityId}` : ''}</div>
                    </div>
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Meta</div>
                      <div className="table-mobile-value" style={{ wordBreak: 'break-all', fontSize: 12 }}>{row.metadata ? JSON.stringify(row.metadata) : '-'}</div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  pageSize={pageSize}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
