import { useEffect, useState } from 'react'
import { usersApi } from '../services/users'
import { type Role, type User } from '../services/types'
import { useAuth } from '../utils/auth'
import { useMinLoading } from '../hooks/use-min-loading'
import { ConfirmDialog } from '../components/confirm-dialog'
import { RetryPanel } from '../components/retry-panel'
import { useCopyToClipboard } from '../utils/clipboard'
import { SkeletonTable } from '../components/skeleton-table'
import { EmptyState } from '../components/empty-state'

export default function UsersPage() {
  const { isAuthenticated, initialized, role } = useAuth()
  const [data, setData] = useState<User[]>([])
  const { loading, startLoading, stopLoading } = useMinLoading()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ email: '', password: '', role: 'manager' as Role })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ email: '', password: '', role: 'manager' as Role })
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', description: '', onConfirm: null as null | (() => void) })
  const [reloadKey, setReloadKey] = useState(0)

  const canManageUsers = role === 'admin'
  const roles: Role[] = ['admin', 'manager', 'operator', 'analyst']
  const copyToClipboard = useCopyToClipboard()
  const isCreateValid = form.email.trim().length > 0 && form.password.trim().length > 0
  const isEditValid = editForm.email.trim().length > 0
  const createDisabledReason = form.email.trim().length === 0
    ? 'Введите email'
    : form.password.trim().length === 0
      ? 'Введите пароль'
      : ''
  const editDisabledReason = editForm.email.trim().length === 0 ? 'Введите email' : ''

  useEffect(() => {
    if (!initialized || !isAuthenticated || !canManageUsers) return
    startLoading()
    usersApi.list()
      .then((res) => setData(res))
      .catch((e) => setError((e as Error).message))
      .finally(() => stopLoading())
  }, [initialized, isAuthenticated, canManageUsers, reloadKey])

  const handleRetry = () => {
    setError(null)
    setReloadKey((prev) => prev + 1)
  }

  if (!canManageUsers) {
    return (
      <div className="card">
        <div className="empty-state">Недостаточно прав для управления пользователями</div>
      </div>
    )
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const email = form.email.trim()
    const password = form.password.trim()
    if (!email || !password) {
      setError('Заполните все поля')
      return
    }
    startLoading()
    try {
      const created = await usersApi.create({ email, password, role: form.role })
      setData((prev) => [created, ...prev])
      setForm({ email: '', password: '', role: 'manager' })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      stopLoading()
    }
  }

  const startEdit = (user: User) => {
    setEditingId(user.id)
    setEditForm({ email: user.email, password: '', role: user.role })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    setError(null)
    const email = editForm.email.trim()
    const password = editForm.password.trim()
    if (!email) {
      setError('Email обязателен')
      return
    }
    startLoading()
    try {
      const updated = await usersApi.update(editingId, {
        email,
        role: editForm.role,
        password: password || undefined
      })
      setData((prev) => prev.map((u) => u.id === updated.id ? updated : u))
      setEditingId(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      stopLoading()
    }
  }

  const handleDelete = async (user: User) => {
    setError(null)
    startLoading()
    try {
      await usersApi.remove(user.id)
      setData((prev) => prev.filter((u) => u.id !== user.id))
      if (editingId === user.id) {
        setEditingId(null)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      stopLoading()
    }
  }

  const confirmDelete = (user: User) => {
    setConfirmState({
      isOpen: true,
      title: 'Удаление пользователя',
      description: `Удалить пользователя ${user.email}?`,
      onConfirm: () => {
        handleDelete(user)
        setConfirmState({ isOpen: false, title: '', description: '', onConfirm: null })
      }
    })
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3>Пользователи</h3>
      </div>
      <form className="grid" style={{ gap: 8, gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 12 }} onSubmit={handleCreate}>
        <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <input className="input" placeholder="Пароль" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        <select className="input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}>
          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <span title={!isCreateValid ? createDisabledReason : undefined} style={{ display: 'inline-block' }}>
          <button className="btn" type="submit" disabled={loading || !isCreateValid}>Создать</button>
        </span>
      </form>
      {editingId && (
        <form className="grid" style={{ gap: 8, gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 12 }} onSubmit={handleUpdate}>
          <input className="input" placeholder="Email" type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
          <input className="input" placeholder="Новый пароль (опц.)" type="password" value={editForm.password} onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))} />
          <select className="input" value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as Role }))}>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <span title={!isEditValid ? editDisabledReason : undefined} style={{ display: 'inline-block' }}>
              <button className="btn" type="submit" disabled={loading || !isEditValid}>Сохранить</button>
            </span>
            <button className="btn secondary" type="button" onClick={() => setEditingId(null)}>Отмена</button>
          </div>
        </form>
      )}
      {loading && <SkeletonTable rows={5} cols={4} />}
      {error && <RetryPanel message={error} onRetry={handleRetry} />}
      {!loading && !error && (
        <>
          {data.length === 0 ? (
            <EmptyState
              title="Нет пользователей"
              description="Создайте первого пользователя для начала работы"
              icon="empty"
            />
          ) : (
            <>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Роль</th>
                      <th>Создан</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((u) => (
                      <tr key={u.id}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{u.email}</span>
                          <button
                            className="btn secondary"
                            type="button"
                            onClick={() => copyToClipboard(u.email, 'Email')}
                            style={{ padding: '4px 8px', fontSize: 12 }}
                          >
                            Копировать
                          </button>
                        </td>
                        <td className="cell-nowrap">{u.role}</td>
                        <td>{new Date(u.createdAt).toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn secondary" type="button" onClick={() => startEdit(u)}>Редактировать</button>
                            <button className="btn secondary" type="button" onClick={() => confirmDelete(u)}>Удалить</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="table-mobile">
                {data.map((u) => (
                  <div key={u.id} className="table-mobile-card">
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Email</div>
                      <div className="table-mobile-value">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span>{u.email}</span>
                          <button
                            className="btn secondary"
                            type="button"
                            onClick={() => copyToClipboard(u.email, 'Email')}
                            style={{ padding: '4px 8px', fontSize: 12 }}
                          >
                            Копировать
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Роль</div>
                      <div className="table-mobile-value">{u.role}</div>
                    </div>
                    <div className="table-mobile-row">
                      <div className="table-mobile-label">Создан</div>
                      <div className="table-mobile-value">{new Date(u.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="table-mobile-actions">
                      <button className="btn secondary" type="button" onClick={() => startEdit(u)}>Редактировать</button>
                      <button className="btn secondary" type="button" onClick={() => confirmDelete(u)}>Удалить</button>
                    </div>
                  </div>
                ))}
              </div>
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
