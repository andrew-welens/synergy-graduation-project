import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <p style={{ margin: 0 }}>Страница не найдена</p>
      <Link className="btn" to="/">
        На главную
      </Link>
    </div>
  )
}
