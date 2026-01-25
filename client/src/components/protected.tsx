import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../utils/auth'
import { type Role } from '../services/types'

export default function Protected({ children, roles }: { children: React.ReactNode, roles?: Role[] }) {
  const { isAuthenticated, initialized, ensure } = useAuth()
  const role = useAuth((state) => state.role)
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
  if (roles && (!role || !roles.includes(role))) {
    return <Navigate to="/forbidden" state={{ from: location }} replace />
  }
  return children
}
