import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../utils/auth'
import { type Role } from '../services/types'
import AuthLoader from './auth-loader'

const AUTH_LOADER_MIN_MS = 750

export default function Protected({ children, roles }: { children: React.ReactNode, roles?: Role[] }) {
  const { isAuthenticated, initialized, ensure } = useAuth()
  const role = useAuth((state) => state.role)
  const location = useLocation()
  const [showLoader, setShowLoader] = useState(false)
  const loaderStartedAtRef = useRef<number | null>(null)

  useEffect(() => {
    ensure().catch(() => {})
  }, [ensure])

  useEffect(() => {
    if (!initialized) {
      loaderStartedAtRef.current = Date.now()
      setShowLoader(true)
    }
  }, [initialized])

  useEffect(() => {
    if (initialized && showLoader) {
      const start = loaderStartedAtRef.current ?? Date.now()
      const remaining = Math.max(0, AUTH_LOADER_MIN_MS - (Date.now() - start))
      const t = window.setTimeout(() => setShowLoader(false), remaining)
      return () => window.clearTimeout(t)
    }
  }, [initialized, showLoader])

  if (!initialized || showLoader) {
    return (
      <div className="auth-page">
        <div className="card auth-card">
          <AuthLoader message="Загрузка данных..." />
        </div>
      </div>
    )
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (roles && (!role || !roles.includes(role))) {
    return <Navigate to="/forbidden" state={{ from: location }} replace />
  }
  return children
}
