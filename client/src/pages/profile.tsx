import { useAuth } from '../utils/auth'

export default function ProfilePage() {
  const { role, userId } = useAuth()

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3>Профиль</h3>
      </div>
      <div className="grid" style={{ gap: 6 }}>
        <div><strong>ID:</strong> {userId ?? '—'}</div>
        <div><strong>Роль:</strong> {role ?? '—'}</div>
      </div>
    </div>
  )
}
