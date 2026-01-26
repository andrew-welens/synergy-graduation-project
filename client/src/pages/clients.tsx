import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { clientsApi } from '../services/clients'
import { type Client } from '../services/types'
import { useAuth } from '../utils/auth'
import { Link } from 'react-router-dom'
import { useMinLoading } from '../hooks/use-min-loading'
import { ConfirmDialog } from '../components/confirm-dialog'
import { RetryPanel } from '../components/retry-panel'
import { useToast } from '../utils/toast'
import { useDebounce } from '../hooks/use-debounce'
import { SkeletonTable } from '../components/skeleton-table'
import { Pagination } from '../components/pagination'
import { EmptyState } from '../components/empty-state'
import { Tooltip } from '../components/tooltip'

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
  const debouncedSearch = useDebounce(searchInput.trim(), 300)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', city: '', address: '', tags: '', type: 'legal', inn: '' })
  const [typeFilter, setTypeFilter] = useState<'all' | 'legal' | 'individual'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'ordersCount' | 'createdAt'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
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
    if (!digits) return '+7 '
    let local = digits
    if (digits.startsWith('7') || digits.startsWith('8')) {
      local = digits.slice(1)
    }
    local = local.slice(0, 10)
    let result = '+7'
    if (local.length > 0) {
      result += ` (${local.slice(0, 3)}`
      if (local.length > 3) {
        result += `) ${local.slice(3, 6)}`
        if (local.length > 6) {
          result += `-${local.slice(6, 8)}`
          if (local.length > 8) {
            result += `-${local.slice(8, 10)}`
          }
        }
      } else if (local.length === 3) {
        result += ')'
      }
    } else {
      result += ' '
    }
    return result
  }
  const formatInn = (value: string) => {
    const digits = normalizeInn(value)
    if (!digits) return ''
    return digits
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
    const phoneValue = client.phone ?? ''
    setEditForm({
      name: client.name,
      email: client.email ?? '',
      phone: phoneValue ? formatPhone(phoneValue) : '+7 ',
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
    setForm({ name: '', email: '', phone: '+7 ', city: '', address: '', tags: '', type: 'legal', inn: '' })
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
    if (debouncedSearch) {
      chips.push({ key: 'search', label: `Поиск: ${debouncedSearch}`, onClear: () => { setSearchInput(''); setPage(1) } })
    }
    if (onlyWithOrders) {
      chips.push({ key: 'orders', label: 'Только с заказами', onClear: () => { setOnlyWithOrders(false); setPage(1) } })
    }
    if (typeFilter !== 'all') {
      chips.push({ key: 'type', label: typeFilter === 'legal' ? 'Юрлица' : 'Физлица', onClear: () => { setTypeFilter('all'); setPage(1) } })
    }
    return chips
  }, [debouncedSearch, onlyWithOrders, typeFilter])

  const hasActiveFilters = filterChips.length > 0

  const resetFilters = () => {
    setOnlyWithOrders(false)
    setTypeFilter('all')
    setSearchInput('')
    setPage(1)
  }

  const closeMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    const details = event.currentTarget.closest('details')
    if (details) details.removeAttribute('open')
  }

  useEffect(() => {
    const handleBackdropClick = (event: Event) => {
      const target = event.target as HTMLElement
      const menu = target.closest('details.menu[open]')
      if (menu && !menu.querySelector('.menu-content')?.contains(target)) {
        menu.removeAttribute('open')
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const openMenus = document.querySelectorAll('details.menu[open]')
        openMenus.forEach((menu) => {
          menu.removeAttribute('open')
        })
      }
    }

    document.addEventListener('click', handleBackdropClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('click', handleBackdropClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    if (!initialized || !isAuthenticated) return
    startLoading()
    clientsApi.list({ page, pageSize, hasOrders: onlyWithOrders, search: debouncedSearch, type: typeFilter === 'all' ? undefined : typeFilter, sortBy, sortDir })
      .then((res) => {
        setData(res.data)
        setTotal(res.total)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => stopLoading())
  }, [initialized, isAuthenticated, onlyWithOrders, debouncedSearch, typeFilter, page, pageSize, sortBy, sortDir, reloadKey])

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
      setForm({ name: '', email: '', phone: '+7 ', city: '', address: '', tags: '', type: 'legal', inn: '' })
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
            <button className="btn secondary" type="button" onClick={() => { setSearchInput(''); setPage(1) }}>
              Очистить
            </button>
          )}
        </div>
        <select className="input" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as 'all' | 'legal' | 'individual'); setPage(1) }}>
          <option value="all">Все типы</option>
          <option value="legal">Только юрлица</option>
          <option value="individual">Только физлица</option>
        </select>
        <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'email' | 'ordersCount' | 'createdAt')}>
          <option value="name">Сортировка: имя</option>
          <option value="email">Сортировка: email</option>
          <option value="ordersCount">Сортировка: заказы</option>
          <option value="createdAt">Сортировка: дата создания</option>
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
      {loading && <SkeletonTable rows={5} cols={7} />}
      {error && <RetryPanel message={error} onRetry={handleRetry} />}
      {!loading && !error && (
        <>
          {data.length === 0 ? (
            <EmptyState
              title={hasActiveFilters ? 'Ничего не найдено' : 'Клиентов пока нет'}
              description={hasActiveFilters ? 'Попробуйте изменить параметры поиска или сбросить фильтры' : 'Начните работу, создав первого клиента'}
              icon={hasActiveFilters ? 'search' : 'empty'}
              action={
                <>
                  {hasActiveFilters && <button className="btn secondary" type="button" onClick={resetFilters}>Сбросить фильтры</button>}
                  {!hasActiveFilters && canWrite && <button className="btn secondary" type="button" onClick={openCreateForm}>Добавить клиента</button>}
                </>
              }
            />
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
                          <Tooltip content="Открыть карточку клиента">
                            <Link to={`/clients/${c.id}`} className="btn secondary">Открыть</Link>
                          </Tooltip>
                          <details className="menu">
                            <Tooltip content="Дополнительные действия">
                              <summary className="btn secondary">⋯</summary>
                            </Tooltip>
                            <div className="menu-content" onClick={(e) => e.stopPropagation()}>
                              <div className="menu-header">
                                <div className="menu-title">Действия</div>
                                <button className="menu-close" type="button" onClick={closeMenu} aria-label="Закрыть">×</button>
                              </div>
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
              <div className="table-mobile">
                {data.map((c) => (
                  <div key={c.id} className="table-mobile-card">
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Имя</div>
                      <div className="table-mobile-value"><Link to={`/clients/${c.id}`}>{c.name}</Link></div>
                    </div>
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Email</div>
                      <div className="table-mobile-value">{c.email ?? '—'}</div>
                    </div>
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Телефон</div>
                      <div className="table-mobile-value">{c.phone ?? '—'}</div>
                    </div>
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Тип</div>
                      <div className="table-mobile-value">{c.type === 'legal' ? 'Юрлицо' : 'Физлицо'} {c.inn ? `(${c.inn})` : ''}</div>
                    </div>
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Теги</div>
                      <div className="table-mobile-value">{c.tags?.join(', ') || '—'}</div>
                    </div>
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Заказы</div>
                      <div className="table-mobile-value">{c.ordersCount ?? 0}</div>
                    </div>
                    <div className="table-mobile-actions">
                      <Link to={`/clients/${c.id}`} className="btn secondary">Открыть</Link>
                      <details className="menu">
                        <summary className="btn secondary">⋯</summary>
                        <div className="menu-content" onClick={(e) => e.stopPropagation()}>
                          <div className="menu-header">
                            <div className="menu-title">Действия</div>
                            <button className="menu-close" type="button" onClick={closeMenu} aria-label="Закрыть">×</button>
                          </div>
                          <Link to={`/clients/${c.id}/interactions`} className="menu-item" onClick={closeMenu}>Взаимодействия</Link>
                          {canWrite && <Link to={`/orders?clientId=${c.id}`} className="menu-item" onClick={closeMenu}>Создать заказ</Link>}
                          {canWrite && <button className="menu-item" type="button" onClick={(e) => { closeMenu(e); startEdit(c) }}>Редактировать</button>}
                          {canDelete && <button className="menu-item" type="button" onClick={(e) => { closeMenu(e); confirmDelete(c) }}>Удалить</button>}
                        </div>
                      </details>
                    </div>
                  </div>
                ))}
              </div>
              {total > 0 && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
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
                  placeholder="+7 (___) ___-__-__"
                  value={formMode === 'create' ? form.phone : editForm.phone}
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={18}
                  title="Формат: +7 (900) 000-00-00"
                  onChange={(e) => {
                    const inputValue = e.target.value
                    if (inputValue.length < 3) {
                      updateActiveForm({ phone: '+7 ' })
                      return
                    }
                    const formatted = formatPhone(inputValue)
                    updateActiveForm({ phone: formatted })
                  }}
                  onFocus={(e) => {
                    if (!e.target.value || e.target.value === '+7') {
                      e.target.setSelectionRange(3, 3)
                    }
                  }}
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
                  placeholder="ИНН (10 цифр)"
                  value={formMode === 'create' ? form.inn : editForm.inn}
                  required={(formMode === 'create' ? form.type : editForm.type) === 'legal'}
                  inputMode="numeric"
                  maxLength={10}
                  pattern="^\d{10}$"
                  title="ИНН должен состоять из 10 цифр"
                  onChange={(e) => {
                    const formatted = formatInn(e.target.value)
                    updateActiveForm({ inn: formatted })
                  }}
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
