import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { interactionsApi } from '../services/interactions'
import { type Interaction } from '../services/types'
import { useAuth } from '../utils/auth'
import { useMinLoading } from '../hooks/use-min-loading'
import { AppDateRangePicker } from '../components/date-range-picker'
import { ConfirmDialog } from '../components/confirm-dialog'
import { RetryPanel } from '../components/retry-panel'

const DEFAULT_CHANNEL_HINTS = ['Email', 'Телефон', 'Встреча', 'Мессенджер', 'Письмо', 'Чат']

export default function InteractionsPage() {
  const { isAuthenticated, initialized, role } = useAuth()
  const { clientId } = useParams()
  const [data, setData] = useState<Interaction[]>([])
  const [total, setTotal] = useState(0)
  const { loading, startLoading, stopLoading } = useMinLoading()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ channel: '', description: '' })
  const [channelFilter, setChannelFilter] = useState('')
  const channelOptions = useMemo(() => Array.from(new Set([...DEFAULT_CHANNEL_HINTS, ...data.map((i) => i.channel).filter(Boolean)])).sort(), [data])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ channel: '', description: '' })
  const channelOptionsWithEdit = useMemo(() => {
    if (!editingId || !editForm.channel.trim()) return channelOptions
    return channelOptions.includes(editForm.channel) ? channelOptions : [editForm.channel, ...channelOptions].sort()
  }, [channelOptions, editingId, editForm.channel])
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', description: '', onConfirm: null as null | (() => void) })
  const [reloadKey, setReloadKey] = useState(0)

  const canWrite = role === 'admin' || role === 'manager' || role === 'operator'
  const canDelete = role === 'admin' || role === 'manager'
  const isCreateValid = form.channel.trim().length > 0 && form.description.trim().length > 0
  const isEditValid = editForm.channel.trim().length > 0 && editForm.description.trim().length > 0
  const createDisabledReason = form.channel.trim().length === 0
    ? 'Введите канал'
    : form.description.trim().length === 0
      ? 'Введите описание'
      : ''
  const editDisabledReason = editForm.channel.trim().length === 0
    ? 'Введите канал'
    : editForm.description.trim().length === 0
      ? 'Введите описание'
      : ''

  useEffect(() => {
    if (!initialized || !isAuthenticated || !clientId) return
    startLoading()
    interactionsApi.list(clientId, { page, pageSize, channel: channelFilter || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined })
      .then((res) => {
        setData(res.data)
        setTotal(res.total)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => stopLoading())
  }, [initialized, isAuthenticated, clientId, page, pageSize, channelFilter, dateFrom, dateTo, reloadKey])

  const handleRetry = () => {
    setError(null)
    setReloadKey((prev) => prev + 1)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) return
    setError(null)
    startLoading()
    try {
      const channel = form.channel.trim()
      const description = form.description.trim()
      if (!channel || !description) {
        setError('Заполните все поля')
        return
      }
      const created = await interactionsApi.create(clientId, { channel, description })
      setData((prev) => [created, ...prev])
      setTotal((prev) => prev + 1)
      setForm({ channel: '', description: '' })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      stopLoading()
    }
  }

  const startEdit = (interaction: Interaction) => {
    setEditingId(interaction.id)
    setEditForm({ channel: interaction.channel, description: interaction.description })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !editingId) return
    setError(null)
    startLoading()
    try {
      const channel = editForm.channel.trim()
      const description = editForm.description.trim()
      if (!channel || !description) {
        setError('Заполните все поля')
        return
      }
      const updated = await interactionsApi.update(clientId, editingId, { channel, description })
      setData((prev) => prev.map((i) => i.id === updated.id ? updated : i))
      setEditingId(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      stopLoading()
    }
  }

  const handleDelete = async (interaction: Interaction) => {
    if (!clientId) return
    setError(null)
    startLoading()
    try {
      await interactionsApi.remove(clientId, interaction.id)
      setData((prev) => prev.filter((i) => i.id !== interaction.id))
      setTotal((prev) => Math.max(0, prev - 1))
      if (editingId === interaction.id) {
        setEditingId(null)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      stopLoading()
    }
  }

  const confirmDelete = (interaction: Interaction) => {
    setConfirmState({
      isOpen: true,
      title: 'Удаление взаимодействия',
      description: 'Удалить выбранное взаимодействие?',
      onConfirm: () => {
        handleDelete(interaction)
        setConfirmState({ isOpen: false, title: '', description: '', onConfirm: null })
      }
    })
  }

  return (
    <div className="card">
      <div className="breadcrumbs" style={{ marginBottom: 12 }}>
        <Link to="/">Главная</Link>
        <span>•</span>
        <Link to="/clients">Клиенты</Link>
        <span>•</span>
        <span>{clientId}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3>Взаимодействия клиента {clientId}</h3>
        <span style={{ color: '#64748b', fontSize: 14 }}>{total}</span>
      </div>
      <div className="grid" style={{ gap: 8, gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 12 }}>
        <select className="input" value={channelFilter} onChange={(e) => { setChannelFilter(e.target.value); setPage(1) }} aria-label="Фильтр по каналу">
          <option value="">Все каналы</option>
          {channelOptions.map((ch) => (
            <option key={ch} value={ch}>{ch}</option>
          ))}
        </select>
        <AppDateRangePicker
          from={dateFrom}
          to={dateTo}
          onChange={(from, to) => { setDateFrom(from); setDateTo(to); setPage(1) }}
          placeholder="Период"
        />
      </div>
      {canWrite && (
        <form className="grid" style={{ gap: 8, gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 12 }} onSubmit={handleCreate}>
          <select className="input" value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))} aria-label="Канал">
            <option value="">Выберите канал</option>
            {channelOptions.map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
          <input className="input" placeholder="Описание" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <span title={!isCreateValid ? createDisabledReason : undefined} style={{ display: 'inline-block' }}>
            <button className="btn" type="submit" disabled={loading || !isCreateValid}>Добавить</button>
          </span>
        </form>
      )}
      {canWrite && editingId && (
        <form className="grid" style={{ gap: 8, gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 12 }} onSubmit={handleUpdate}>
          <select className="input" value={editForm.channel} onChange={(e) => setEditForm((f) => ({ ...f, channel: e.target.value }))} aria-label="Канал">
            <option value="">Выберите канал</option>
            {channelOptionsWithEdit.map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
          <input className="input" placeholder="Описание" value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
          <div style={{ display: 'flex', gap: 8 }}>
            <span title={!isEditValid ? editDisabledReason : undefined} style={{ display: 'inline-block' }}>
              <button className="btn" type="submit" disabled={loading || !isEditValid}>Сохранить</button>
            </span>
            <button className="btn secondary" type="button" onClick={() => setEditingId(null)}>Отмена</button>
          </div>
        </form>
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
              <div>Нет данных</div>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Канал</th>
                      <th>Описание</th>
                      <th>Дата</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((i) => (
                      <tr key={i.id}>
                        <td>{i.channel}</td>
                        <td>{i.description}</td>
                        <td>{new Date(i.createdAt).toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {canWrite && <button className="btn secondary" type="button" onClick={() => startEdit(i)}>Редактировать</button>}
                            {canDelete && <button className="btn secondary" type="button" onClick={() => confirmDelete(i)}>Удалить</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel="Удалить"
        onConfirm={() => confirmState.onConfirm?.()}
        onCancel={() => setConfirmState({ isOpen: false, title: '', description: '', onConfirm: null })}
      />
    </div>
  )
}
