import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../state/auth'

export default function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initialized, ensure } = useAuth()
  const location = useLocation()

  useEffect(() => {
    ensure().catch(() => {})
  }, [ensure])

  if (!initialized) {
    return <div style={{ padding: 16 }}>Проверка сессии...</div>
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}
