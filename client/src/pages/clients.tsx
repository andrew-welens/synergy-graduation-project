import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { clientsApi } from '../services/clients'
import { type Client } from '../services/types'
import { useAuth } from '../utils/auth'
import { Link } from 'react-router-dom'
import { useMinLoading } from '../hooks/use-min-loading'
import { ConfirmDialog } from '../components/confirm-dialog'
import { RetryPanel } from '../components/retry-panel'
import { useToast } from '../utils/toast'

export default function ClientsPage() {
  const { isAuthenticated, initialized, role } = useAuth()
  const [data, setData] = useState<Client[]>([])
  const [total, setTotal] = useState(0)
  const { loading, startLoading, stopLoading } = useMinLoading()
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', address: '', tags: '', type: 'legal', inn: '' })
  const [onlyWithOrders, setOnlyWithOrders] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', city: '', address: '', tags: '', type: 'legal', inn: '' })
  const [typeFilter, setTypeFilter] = useState<'all' | 'legal' | 'individual'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'ordersCount'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', description: '', onConfirm: null as null | (() => void) })
  const [reloadKey, setReloadKey] = useState(0)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const addToast = useToast((state) => state.add)

  const normalizePhone = (value: string) => value.replace(/\D/g, '')
  const normalizeInn = (value: string) => value.replace(/\D/g, '').slice(0, 10)
  const formatPhone = (value: string) => {
    const digits = normalizePhone(value)
    if (!digits) return ''
    let local = digits
    if (digits.startsWith('7') || digits.startsWith('8')) {
      local = digits.slice(1)
    }
    local = local.slice(0, 10)
    let result = '+7'
    if (local.length > 0) result += ` ${local.slice(0, 3)}`
    if (local.length > 3) result += ` ${local.slice(3, 6)}`
    if (local.length > 6) result += `-${local.slice(6, 8)}`
    if (local.length > 8) result += `-${local.slice(8, 10)}`
    return result
  }

  const canWrite = role === 'admin' || role === 'manager' || role === 'operator'
  const canDelete = role === 'admin'
  const normalizedCreateInn = normalizeInn(form.inn)
  const isCreateValid = form.name.trim().length > 0 && (form.type !== 'legal' || normalizedCreateInn.length === 10)
  const normalizedEditInn = normalizeInn(editForm.inn)
  const isEditValid = editForm.name.trim().length > 0 && (editForm.type !== 'legal' || normalizedEditInn.length === 10)
  const createDisabledReason = form.name.trim().length === 0
    ? 'Введите имя'
    : form.type === 'legal' && normalizedCreateInn.length !== 10
      ? 'Введите ИНН из 10 цифр'
      : ''
  const editDisabledReason = editForm.name.trim().length === 0
    ? 'Введите имя'
    : editForm.type === 'legal' && normalizedEditInn.length !== 10
      ? 'Введите ИНН из 10 цифр'
      : ''

  const validateClientForm = (value: { name: string, email: string, phone: string, city: string, address: string, tags: string, type: string, inn: string }) => {
    const errors: Record<string, string> = {}
    if (!value.name.trim()) {
      errors.name = 'Введите имя'
    }
    const emailValue = value.email.trim()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailValue && !emailPattern.test(emailValue)) {
      errors.email = 'Email должен быть корректным'
    }
    const phoneValue = normalizePhone(value.phone)
    if (phoneValue && phoneValue.length < 5) {
      errors.phone = 'Телефон должен быть не короче 5 символов'
    }
    const normalizedInn = normalizeInn(value.inn)
    if (value.type === 'legal' && normalizedInn.length !== 10) {
      errors.inn = 'ИНН должен состоять из 10 цифр'
    }
    return errors
  }

  const buildPayload = (value: { name: string, email: string, phone: string, city: string, address: string, tags: string, type: string, inn: string }) => {
    const emailValue = value.email.trim()
    const phoneValue = normalizePhone(value.phone)
    const normalizedInn = normalizeInn(value.inn)
    return {
      name: value.name.trim(),
      email: emailValue || undefined,
      phone: phoneValue || undefined,
      city: value.city.trim() || undefined,
      address: value.address.trim() || undefined,
      tags: value.tags ? value.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      type: value.type as 'legal' | 'individual',
      inn: value.type === 'legal' ? normalizedInn || undefined : undefined
    }
  }

  const startEdit = (client: Client) => {
    setEditingId(client.id)
    setEditFieldErrors({})
    setEditForm({
      name: client.name,
      email: client.email ?? '',
      phone: formatPhone(client.phone ?? ''),
      city: client.city ?? '',
      address: client.address ?? '',
      tags: client.tags?.join(', ') ?? '',
      type: client.type,
      inn: client.inn ?? ''
    })
    setFormMode('edit')
    setIsFormOpen(true)
  }

  const openCreateForm = () => {
    setFormMode('create')
    setIsFormOpen(true)
    setFieldErrors({})
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
    setFormError(null)
    setEditError(null)
    setFieldErrors({})
    setEditFieldErrors({})
  }

  const updateActiveForm = (patch: Partial<typeof form>) => {
    if (formMode === 'edit') {
      setEditForm((prev) => ({ ...prev, ...patch }))
      setEditFieldErrors((prev) => {
        const next = { ...prev }
        Object.keys(patch).forEach((key) => { delete next[key] })
        return next
      })
    } else {
      setForm((prev) => ({ ...prev, ...patch }))
      setFieldErrors((prev) => {
        const next = { ...prev }
        Object.keys(patch).forEach((key) => { delete next[key] })
        return next
      })
    }
  }

  const fieldError = (key: string) => (formMode === 'create' ? fieldErrors[key] : editFieldErrors[key])

  const filterChips = useMemo(() => {
    const chips: { key: string, label: string, onClear: () => void }[] = []
    if (search.trim()) {
      chips.push({ key: 'search', label: `Поиск: ${search}`, onClear: () => { setSearch(''); setSearchInput(''); setPage(1) } })
    }
    if (onlyWithOrders) {
      chips.push({ key: 'orders', label: 'Только с заказами', onClear: () => { setOnlyWithOrders(false); setPage(1) } })
    }
    if (typeFilter !== 'all') {
      chips.push({ key: 'type', label: typeFilter === 'legal' ? 'Юрлица' : 'Физлица', onClear: () => { setTypeFilter('all'); setPage(1) } })
    }
    return chips
  }, [search, onlyWithOrders, typeFilter])

  const hasActiveFilters = filterChips.length > 0

  const resetFilters = () => {
    setOnlyWithOrders(false)
    setTypeFilter('all')
    setSearch('')
    setSearchInput('')
    setPage(1)
  }

  const closeMenu = (event: MouseEvent<HTMLElement>) => {
    const details = event.currentTarget.closest('details')
    if (details) details.removeAttribute('open')
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput.trim())
    }, 400)
    return () => clearTimeout(handler)
  }, [searchInput])

  useEffect(() => {
    if (!initialized || !isAuthenticated) return
    startLoading()
    clientsApi.list({ page, pageSize, hasOrders: onlyWithOrders, search, type: typeFilter === 'all' ? undefined : typeFilter, sortBy, sortDir })
      .then((res) => {
        setData(res.data)
        setTotal(res.total)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => stopLoading())
  }, [initialized, isAuthenticated, onlyWithOrders, search, typeFilter, page, pageSize, sortBy, sortDir, reloadKey])

  const handleRetry = () => {
    setError(null)
    setReloadKey((prev) => prev + 1)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFormError(null)
    const errors = validateClientForm(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    startLoading()
    try {
      const payload = buildPayload(form)
      const created = await clientsApi.create(payload)
      setData((prev) => [created, ...prev])
      setTotal((prev) => prev + 1)
      setForm({ name: '', email: '', phone: '', city: '', address: '', tags: '', type: 'legal', inn: '' })
      setFieldErrors({})
      setIsFormOpen(false)
      addToast({ type: 'success', title: 'Клиент создан', description: created.name })
    } catch (e) {
      setFormError((e as Error).message)
    } finally {
      stopLoading()
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    setError(null)
    setEditError(null)
    const errors = validateClientForm(editForm)
    setEditFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    startLoading()
    try {
      const payload = buildPayload(editForm)
      const updated = await clientsApi.update(editingId, payload)
      setData((prev) => prev.map((c) => c.id === updated.id ? updated : c))
      setEditingId(null)
      setEditFieldErrors({})
      setIsFormOpen(false)
      addToast({ type: 'success', title: 'Клиент обновлен', description: updated.name })
    } catch (e) {
      setEditError((e as Error).message)
    } finally {
      stopLoading()
    }
  }

  const handleDelete = async (client: Client) => {
    setError(null)
    startLoading()
    try {
      await clientsApi.remove(client.id)
      setData((prev) => prev.filter((c) => c.id !== client.id))
      setTotal((prev) => Math.max(0, prev - 1))
      if (editingId === client.id) {
        setEditingId(null)
      }
      addToast({ type: 'success', title: 'Клиент удален', description: client.name })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      stopLoading()
    }
  }

  const confirmDelete = (client: Client) => {
    setConfirmState({
      isOpen: true,
      title: 'Удаление клиента',
      description: `Удалить клиента ${client.name}?`,
      onConfirm: () => {
        handleDelete(client)
        setConfirmState({ isOpen: false, title: '', description: '', onConfirm: null })
      }
    })
  }

  return (
    <div className="card">
      <div className="toolbar" style={{ marginBottom: 12 }}>
        <div className="toolbar-title">
          <h3>Клиенты</h3>
          <span className="toolbar-meta">{total} записей</span>
        </div>
        <div className="toolbar-actions">
          {canWrite && <button className="btn" type="button" onClick={openCreateForm}>Создать</button>}
        </div>
      </div>
      <div className="filters-row" style={{ marginBottom: 8 }}>
        <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={onlyWithOrders} onChange={(e) => { setOnlyWithOrders(e.target.checked); setPage(1) }} />
          Только с заказами
        </label>
        <div className="input-group">
          <input
            className="input"
            placeholder="Поиск по имени/email/телефону"
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
            style={{ width: 280 }}
          />
          {searchInput && (
            <button className="btn secondary" type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}>
              Очистить
            </button>
          )}
        </div>
        <select className="input" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as 'all' | 'legal' | 'individual'); setPage(1) }}>
          <option value="all">Все типы</option>
          <option value="legal">Только юрлица</option>
          <option value="individual">Только физлица</option>
        </select>
        <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'email' | 'ordersCount')}>
          <option value="name">Сортировка: имя</option>
          <option value="email">Сортировка: email</option>
          <option value="ordersCount">Сортировка: заказы</option>
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
      {error && <RetryPanel message={error} onRetry={handleRetry} />}
      {!loading && !error && (
        <>
          {data.length === 0 ? (
            <div className="empty-state">
              <div>{hasActiveFilters ? 'Ничего не найдено' : 'Клиентов пока нет'}</div>
              {hasActiveFilters && <button className="btn secondary" type="button" onClick={resetFilters}>Сбросить фильтры</button>}
              {!hasActiveFilters && canWrite && <button className="btn secondary" type="button" onClick={openCreateForm}>Добавить клиента</button>}
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="table">
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Email</th>
                    <th>Телефон</th>
                    <th>Тип</th>
                    <th>Теги</th>
                    <th className="text-right">Заказы</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((c) => (
                    <tr key={c.id}>
                      <td><Link to={`/clients/${c.id}`}>{c.name}</Link></td>
                      <td>{c.email ?? '—'}</td>
                      <td>{c.phone ?? '—'}</td>
                      <td>{c.type === 'legal' ? 'Юрлицо' : 'Физлицо'} {c.inn ? `(${c.inn})` : ''}</td>
                      <td>{c.tags?.join(', ')}</td>
                      <td className="text-right">{c.ordersCount ?? 0}</td>
                      <td>
                        <div className="actions-row">
                          <Link to={`/clients/${c.id}`} className="btn secondary">Открыть</Link>
                          <details className="menu">
                            <summary className="btn secondary">⋯</summary>
                            <div className="menu-content">
                              <Link to={`/clients/${c.id}/interactions`} className="menu-item" onClick={closeMenu}>Взаимодействия</Link>
                              {canWrite && <Link to={`/orders?clientId=${c.id}`} className="menu-item" onClick={closeMenu}>Создать заказ</Link>}
                              {canWrite && <button className="menu-item" type="button" onClick={(e) => { closeMenu(e); startEdit(c) }}>Редактировать</button>}
                              {canDelete && <button className="menu-item" type="button" onClick={(e) => { closeMenu(e); confirmDelete(c) }}>Удалить</button>}
                            </div>
                          </details>
                        </div>
                      </td>
                    </tr>
                  ))}
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
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel="Удалить"
        onConfirm={() => confirmState.onConfirm?.()}
        onCancel={() => setConfirmState({ isOpen: false, title: '', description: '', onConfirm: null })}
      />
      {isFormOpen && (
        <>
          <button className="drawer-backdrop" type="button" aria-label="Закрыть форму" onClick={closeForm} />
          <div className="drawer">
            <div className="drawer-header">
              <div className="drawer-title">{formMode === 'create' ? 'Новый клиент' : 'Редактирование клиента'}</div>
              <button className="btn secondary" type="button" onClick={closeForm}>Закрыть</button>
            </div>
            <form className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }} onSubmit={formMode === 'create' ? handleCreate : handleUpdate}>
              <div>
                <input className="input" required placeholder="Имя" value={formMode === 'create' ? form.name : editForm.name} onChange={(e) => updateActiveForm({ name: e.target.value })} />
                {fieldError('name') && <div className="form-error">{fieldError('name')}</div>}
              </div>
              <div>
                <input className="input" placeholder="Email" type="email" value={formMode === 'create' ? form.email : editForm.email} onChange={(e) => updateActiveForm({ email: e.target.value })} />
                {fieldError('email') && <div className="form-error">{fieldError('email')}</div>}
              </div>
              <div>
                <input
                  className="input"
                  placeholder="+7 ___ ___-__-__"
                  value={formMode === 'create' ? form.phone : editForm.phone}
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={16}
                  pattern="^\+7 \d{3} \d{3}-\d{2}-\d{2}$"
                  title="Формат: +7 900 000-00-00"
                  onChange={(e) => updateActiveForm({ phone: formatPhone(e.target.value) })}
                />
                {fieldError('phone') && <div className="form-error">{fieldError('phone')}</div>}
              </div>
              <div>
                <select className="input" required value={formMode === 'create' ? form.type : editForm.type} onChange={(e) => updateActiveForm({ type: e.target.value })}>
                  <option value="legal">Юрлицо</option>
                  <option value="individual">Физлицо</option>
                </select>
              </div>
              <div>
                <input
                  className="input"
                  placeholder="ИНН (для юрлиц)"
                  value={formMode === 'create' ? form.inn : editForm.inn}
                  required={(formMode === 'create' ? form.type : editForm.type) === 'legal'}
                  inputMode="numeric"
                  maxLength={10}
                  pattern="^\d{10}$"
                  title="ИНН должен состоять из 10 цифр"
                  onChange={(e) => updateActiveForm({ inn: normalizeInn(e.target.value) })}
                />
                {fieldError('inn') && <div className="form-error">{fieldError('inn')}</div>}
              </div>
              <div>
                <input className="input" placeholder="Теги через запятую" value={formMode === 'create' ? form.tags : editForm.tags} onChange={(e) => updateActiveForm({ tags: e.target.value })} />
              </div>
              <div>
                <input className="input" placeholder="Город" value={formMode === 'create' ? form.city : editForm.city} onChange={(e) => updateActiveForm({ city: e.target.value })} />
              </div>
              <div>
                <input className="input" placeholder="Адрес" value={formMode === 'create' ? form.address : editForm.address} onChange={(e) => updateActiveForm({ address: e.target.value })} />
              </div>
              <div className="actions-row" style={{ gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
                <span title={formMode === 'create' && !isCreateValid ? createDisabledReason : formMode === 'edit' && !isEditValid ? editDisabledReason : undefined} style={{ display: 'inline-block' }}>
                  <button className="btn" type="submit" disabled={loading || (formMode === 'create' ? !isCreateValid : !isEditValid)}>
                    {formMode === 'create' ? 'Добавить' : 'Сохранить'}
                  </button>
                </span>
                <button className="btn secondary" type="button" onClick={closeForm}>Отмена</button>
              </div>
              {formMode === 'create' && formError && <div className="form-error">{formError}</div>}
              {formMode === 'edit' && editError && <div className="form-error">{editError}</div>}
            </form>
          </div>
        </>
      )}
    </div>
  )
}
