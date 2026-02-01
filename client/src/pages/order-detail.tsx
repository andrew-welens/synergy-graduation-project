import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ordersApi } from '../services/orders'
import { catalogApi } from '../services/catalog'
import { clientsApi } from '../services/clients'
import { type Order, type Product, type Client, type OrderStatus } from '../services/types'
import { useAuth } from '../utils/auth'
import { useMinLoading } from '../hooks/use-min-loading'
import { useToast } from '../utils/toast'
import { ConfirmDialog } from '../components/confirm-dialog'
import { auditApi, type AuditEntry } from '../services/audit'
import { RetryPanel } from '../components/retry-panel'
import { useCopyToClipboard } from '../utils/clipboard'
import { SkeletonCard } from '../components/skeleton-card'

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const { isAuthenticated, initialized, role, userId } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [client, setClient] = useState<Client | null>(null)
  const { loading, startLoading, stopLoading } = useMinLoading()
  const [savingItems, setSavingItems] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [savingComments, setSavingComments] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editItems, setEditItems] = useState<{ productId: string, quantity: string }[]>([])
  const [newItem, setNewItem] = useState<{ productId: string, quantity: string }>({ productId: '', quantity: '1' })
  const [statusValue, setStatusValue] = useState<OrderStatus | ''>('')
  const [commentsValue, setCommentsValue] = useState('')
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | ''>('')
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [reloadKey, setReloadKey] = useState(0)
  const addToast = useToast((state) => state.add)
  const copyToClipboard = useCopyToClipboard()

  const orderStatuses: { value: OrderStatus, label: string }[] = [
    { value: 'new', label: 'Новый' },
    { value: 'in_progress', label: 'В обработке' },
    { value: 'done', label: 'Выполнен' },
    { value: 'canceled', label: 'Отменен' }
  ]

  const canWrite = role === 'admin' || role === 'manager' || role === 'operator'
  const canEditOrder = role === 'admin' || role === 'manager'
  const canReadCatalog = role === 'admin' || role === 'manager' || role === 'operator'
  const canReadAudit = role === 'admin' || role === 'analyst'

  const formatCurrency = (value: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value)

  const isItemsDirty = useMemo(() => {
    if (!order) return false
    const current = (order.items ?? [])
      .map((item) => ({ productId: item.productId, quantity: item.quantity }))
      .sort((a, b) => a.productId.localeCompare(b.productId))
    const edited = editItems
      .map((item) => ({ productId: item.productId, quantity: Number(item.quantity) || 0 }))
      .sort((a, b) => a.productId.localeCompare(b.productId))
    if (current.length !== edited.length) return true
    return current.some((item, index) => {
      const other = edited[index]
      return item.productId !== other.productId || item.quantity !== other.quantity
    })
  }, [order, editItems])

  const isNewItemValid = Boolean(newItem.productId) && Number.isFinite(Number(newItem.quantity)) && Number(newItem.quantity) > 0
  const newItemDisabledReason = !newItem.productId
    ? 'Выберите товар'
    : !Number.isFinite(Number(newItem.quantity)) || Number(newItem.quantity) <= 0
      ? 'Укажите количество больше 0'
      : ''
  const saveItemsDisabledReason = editItems.length === 0
    ? 'Добавьте позиции'
    : !isItemsDirty
      ? 'Нет изменений в составе'
      : ''

  useEffect(() => {
    if (!orderId || !initialized || !isAuthenticated) return
    startLoading()
    Promise.all([
      ordersApi.get(orderId),
      canReadAudit ? auditApi.list({ page: 1, pageSize: 20, entityType: 'order', entityId: orderId }) : Promise.resolve({ data: [], total: 0 })
    ])
      .then(async ([o, auditRes]) => {
        setOrder(o)
        setAuditEntries(auditRes.data)
        if (canReadCatalog) {
          const prods = await catalogApi.products({ page: 1, pageSize: 200 })
          setProducts(prods.data)
        } else {
          setProducts([])
        }
        const clientData = await clientsApi.get(o.clientId)
        setClient(clientData)
        setEditItems(o.items?.map((i) => ({ productId: i.productId, quantity: String(i.quantity) })) ?? [])
        setStatusValue('')
        setCommentsValue(o.comments ?? '')
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => stopLoading())
  }, [orderId, initialized, isAuthenticated, canReadCatalog, canReadAudit, reloadKey])

  if (!orderId) return <div className="page">Заказ не найден</div>

  const handleRetry = () => {
    setError(null)
    setReloadKey((prev) => prev + 1)
  }

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!newItem.productId) {
      setError('Выберите товар')
      return
    }
    const quantity = Number(newItem.quantity)
    if (!Number.isFinite(quantity) || quantity < 1) {
      setError('Некорректное количество')
      return
    }
    setEditItems((prev) => [...prev, { productId: newItem.productId, quantity: String(quantity) }])
    setNewItem({ productId: '', quantity: '1' })
  }

  const handleSaveItems = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return
    setError(null)
    if (editItems.length === 0) {
      setError('Добавьте хотя бы одну позицию')
      return
    }
    const payloadItems = editItems.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        throw new Error('Товар не найден')
      }
      const quantity = Number(item.quantity)
      if (!Number.isFinite(quantity) || quantity < 1) {
        throw new Error('Некорректное количество')
      }
      return { productId: item.productId, quantity, price: product.price }
    })
    setSavingItems(true)
    try {
      const updated = await ordersApi.update(order.id, { items: payloadItems })
      setOrder(updated)
      setEditItems(updated.items?.map((i) => ({ productId: i.productId, quantity: String(i.quantity) })) ?? [])
      addToast({ type: 'success', title: 'Состав сохранен', description: 'Изменения применены к заказу' })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSavingItems(false)
    }
  }

  const applyStatusUpdate = async (nextStatus: OrderStatus) => {
    if (!order) return
    setError(null)
    setSavingStatus(true)
    try {
      const updated = await ordersApi.updateStatus(order.id, nextStatus)
      setOrder(updated)
      setStatusValue(updated.status)
      addToast({ type: 'success', title: 'Статус обновлен', description: 'Заказ сохранен' })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSavingStatus(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!order || !statusValue || statusValue === order.status) return
    if (statusValue === 'done' || statusValue === 'canceled') {
      setPendingStatus(statusValue)
      setStatusConfirmOpen(true)
      return
    }
    await applyStatusUpdate(statusValue)
  }

  const handleTakeInWork = async () => {
    if (!order || !userId || !canWrite) return
    const isOpen = order.status !== 'done' && order.status !== 'canceled'
    if (!isOpen) return
    setError(null)
    setAssigning(true)
    try {
      const updated = await ordersApi.update(order.id, { managerId: userId })
      const final = order.status === 'new'
        ? await ordersApi.updateStatus(order.id, 'in_progress')
        : updated
      setOrder(final)
      setStatusValue('')
      if (canReadAudit) {
        const auditRes = await auditApi.list({ page: 1, pageSize: 20, entityType: 'order', entityId: order.id })
        setAuditEntries(auditRes.data)
      }
      addToast({ type: 'success', title: 'Заказ взят в работу', description: 'Вы назначены ответственным' })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setAssigning(false)
    }
  }

  const handleSaveComments = async () => {
    if (!order) return
    setError(null)
    setSavingComments(true)
    try {
      const updated = await ordersApi.update(order.id, { comments: commentsValue.trim() })
      setOrder(updated)
      setCommentsValue(updated.comments ?? '')
      addToast({ type: 'success', title: 'Комментарий сохранен' })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSavingComments(false)
    }
  }

  const auditActionLabels: Record<string, string> = {
    'order.created': 'Создан заказ',
    'order.updated': 'Изменён заказ',
    'order.status.changed': 'Изменён статус заказа'
  }
  const auditActionLabel = (action: string) => auditActionLabels[action] ?? action

  const statusLabel = (status: OrderStatus) => orderStatuses.find((s) => s.value === status)?.label ?? status
  const statusClass = (status: OrderStatus) => {
    if (status === 'new') return 'badge new'
    if (status === 'in_progress') return 'badge in-progress'
    if (status === 'done') return 'badge done'
    if (status === 'canceled') return 'badge canceled'
    return 'badge'
  }

  const getAllowedNextStatuses = (status: OrderStatus, currentRole: typeof role) => {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      new: ['in_progress', 'done', 'canceled'],
      in_progress: ['done', 'canceled'],
      done: [],
      canceled: []
    }
    const base = transitions[status] ?? []
    if (currentRole === 'operator') {
      return status === 'new' ? ['in_progress'] : []
    }
    if (currentRole === 'admin' || currentRole === 'manager') {
      return base
    }
    return []
  }

  const allowedStatuses = order ? getAllowedNextStatuses(order.status, role) : []
  const canChangeStatus = canWrite && allowedStatuses.length > 0
  const isOrderOpen = order && order.status !== 'done' && order.status !== 'canceled'
  const canTakeInWork = isOrderOpen && canWrite && userId && order.managerId !== userId
  const hasOrderManagementAccess = canEditOrder || canChangeStatus || canTakeInWork

  return (
    <div className="page grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="toolbar" style={{ marginBottom: 12 }}>
          <div className="toolbar-title">
            <h3>Заказ</h3>
            <span className="toolbar-meta">{orderId}</span>
          </div>
          <div className="toolbar-actions">
            <Link className="btn secondary" to="/orders">К списку</Link>
            {client && <Link className="btn secondary" to={`/clients/${client.id}`}>Клиент</Link>}
          </div>
        </div>
        {loading && <SkeletonCard lines={3} />}
        {error && <RetryPanel message={error} onRetry={handleRetry} />}
        {order && (
          <div className="grid" style={{ gap: 10 }}>
            <div className="grid" style={{ gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>ID заказа:</strong>
                <span>{orderId}</span>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => copyToClipboard(orderId, 'ID заказа')}
                  style={{ padding: '4px 8px', fontSize: 12 }}
                >
                  Копировать
                </button>
              </div>
              <div><strong>Клиент:</strong> {client ? <Link to={`/clients/${client.id}`}>{client.name}</Link> : order.clientId}</div>
              <div><strong>Статус:</strong> <span className={statusClass(order.status)}>{statusLabel(order.status)}</span></div>
              <div><strong>Ответственный:</strong> {order.managerName ?? order.managerEmail ?? '—'}</div>
              <div><strong>Сумма:</strong> {formatCurrency(order.totalAmount ?? order.total)}</div>
              <div><strong>Комментарий:</strong> {order.comments || '—'}</div>
            </div>
            <div className="grid" style={{ gap: 8 }}>
              <h4>Позиции</h4>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th className="text-right">Кол-во</th>
                      <th className="text-right">Цена</th>
                      <th className="text-right">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((i, idx) => {
                      const product = products.find((p) => p.id === i.productId)
                      const price = product?.price ?? i.price
                      return (
                        <tr key={idx}>
                          <td>{product?.name ?? i.productId}</td>
                          <td className="text-right">{i.quantity}</td>
                          <td className="text-right">{formatCurrency(price)}</td>
                          <td className="text-right">{formatCurrency(price * i.quantity)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {order.history && order.history.length > 0 && (
              <div className="grid" style={{ gap: 8 }}>
                <h4>История статусов</h4>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Статус</th>
                        <th>Дата</th>
                        <th>Исполнитель</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.history.map((h) => (
                        <tr key={h.id}>
                          <td>{h.fromStatus ? `${statusLabel(h.fromStatus)} → ${statusLabel(h.toStatus)}` : statusLabel(h.toStatus)}</td>
                          <td>{new Date(h.createdAt).toLocaleString()}</td>
                          <td>{h.changedByUserId ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {canReadAudit && auditEntries.length > 0 && (
              <div className="grid" style={{ gap: 8 }}>
                <h4>Аудит изменений</h4>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Действие</th>
                        <th>Дата</th>
                        <th>Исполнитель</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditEntries.map((entry) => (
                        <tr key={entry.id}>
                          <td>{auditActionLabel(entry.action)}</td>
                          <td>{new Date(entry.createdAt).toLocaleString()}</td>
                          <td>{entry.userId ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {loading && (
        <div className="skeleton">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      )}
      {order && order.status !== 'done' && order.status !== 'canceled' && hasOrderManagementAccess && (
        <div className="card">
          <div>
            <h4>Управление заказом</h4>
            {canEditOrder && (
              <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                <textarea className="input" rows={3} value={commentsValue} onChange={(e) => setCommentsValue(e.target.value)} placeholder="Комментарий" />
                <button className="btn" type="button" disabled={savingComments} onClick={handleSaveComments}>Сохранить комментарий</button>
              </div>
            )}
            {canEditOrder && (
              <>
                <form className="grid" style={{ gap: 8, gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 8 }} onSubmit={handleAddItem}>
                  <select className="input" value={newItem.productId} onChange={(e) => setNewItem((prev) => ({ ...prev, productId: e.target.value }))}>
                    <option value="">Товар</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)})</option>
                    ))}
                  </select>
                  <input className="input" type="number" min="1" value={newItem.quantity} onChange={(e) => setNewItem((prev) => ({ ...prev, quantity: e.target.value }))} />
                  <span title={!isNewItemValid ? newItemDisabledReason : undefined} style={{ display: 'inline-block' }}>
                    <button className="btn" type="submit" disabled={savingItems || !isNewItemValid}>Добавить позицию</button>
                  </span>
                </form>

                <form className="grid" style={{ gap: 8, marginTop: 12 }} onSubmit={handleSaveItems}>
                  {editItems.length === 0 && <div>Позиции не добавлены</div>}
                  {editItems.map((item, idx) => {
                    const product = products.find((p) => p.id === item.productId)
                    return (
                      <div key={`${item.productId}-${idx}`} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8 }}>
                        <div className="input" style={{ display: 'flex', alignItems: 'center' }}>{product?.name ?? item.productId}</div>
                        <input
                          className="input"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => setEditItems((prev) => prev.map((p, i) => i === idx ? { ...p, quantity: e.target.value } : p))}
                        />
                        <button className="btn" type="button" onClick={() => setEditItems((prev) => prev.filter((_, i) => i !== idx))}>Удалить</button>
                      </div>
                    )
                  })}
                  <span title={saveItemsDisabledReason ? saveItemsDisabledReason : undefined} style={{ display: 'inline-block' }}>
                    <button className="btn" type="submit" disabled={savingItems || editItems.length === 0 || !isItemsDirty}>Сохранить состав</button>
                  </span>
                </form>
              </>
            )}

            {canTakeInWork && (
              <div style={{ marginTop: 12 }}>
                <button className="btn" type="button" onClick={handleTakeInWork} disabled={assigning}>
                  {assigning ? 'Назначение…' : 'Взять в работу'}
                </button>
              </div>
            )}
            {canChangeStatus && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
                <select className="input" value={statusValue} onChange={(e) => setStatusValue(e.target.value as OrderStatus)}>
                  <option value="">Статус</option>
                  {orderStatuses
                    .filter((s) => allowedStatuses.includes(s.value))
                    .map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
                <button className="btn" type="button" onClick={handleUpdateStatus} disabled={savingStatus || !statusValue || statusValue === order.status}>
                  Обновить статус
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={statusConfirmOpen}
        title="Смена статуса"
        description="Подтвердите смену статуса на конечный"
        confirmLabel="Подтвердить"
        onConfirm={() => {
          if (pendingStatus) {
            applyStatusUpdate(pendingStatus)
          }
          setPendingStatus('')
          setStatusConfirmOpen(false)
        }}
        onCancel={() => {
          setPendingStatus('')
          setStatusConfirmOpen(false)
        }}
      />
    </div>
  )
}
