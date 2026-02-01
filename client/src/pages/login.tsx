import { FormEvent, useRef, useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../utils/auth'
import { useTheme } from '../utils/theme'
import AuthLoader from '../components/auth-loader'

const AUTH_LOADER_MIN_MS = 750

export default function LoginPage() {
  const { isAuthenticated, login, loading, error } = useAuth()
  const theme = useTheme((s) => s.theme)
  const toggleTheme = useTheme((s) => s.toggle)
  const navigate = useNavigate()
  const location = useLocation()
  const storedRedirect = sessionStorage.getItem('authRedirect')
  const parsedRedirect = storedRedirect ? JSON.parse(storedRedirect) as { from?: string, message?: string } : null
  const from = (location.state as { from?: Location })?.from?.pathname ?? parsedRedirect?.from ?? '/'
  const sessionMessage = parsedRedirect?.message ?? null
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('password')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [authMessage, setAuthMessage] = useState<string | null>(sessionMessage)
  const [showLoader, setShowLoader] = useState(false)
  const loaderStartedAtRef = useRef<number | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}
    const emailValue = email.trim()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailValue) errors.email = 'Введите email'
    if (emailValue && !emailPattern.test(emailValue)) errors.email = 'Email должен быть корректным'
    if (!password.trim()) errors.password = 'Введите пароль'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    loaderStartedAtRef.current = Date.now()
    setShowLoader(true)
    await login(email, password)
    const elapsed = Date.now() - (loaderStartedAtRef.current ?? 0)
    const remaining = Math.max(0, AUTH_LOADER_MIN_MS - elapsed)
    await new Promise((r) => setTimeout(r, remaining))
    setShowLoader(false)
    if (useAuth.getState().isAuthenticated) {
      sessionStorage.removeItem('authRedirect')
      navigate(from)
    }
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  if (showLoader || loading) {
    return (
      <div className="auth-page">
        <button
          type="button"
          className="theme-toggle-pill auth-theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
        >
          <span className="theme-toggle-pill__track">
            <span className="theme-toggle-pill__handle" data-theme={theme}>
              {theme === 'light' ? (
                <svg className="theme-toggle-pill__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg className="theme-toggle-pill__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </span>
          </span>
        </button>
        <div className="card auth-card">
          <AuthLoader />
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <button
        type="button"
        className="theme-toggle-pill auth-theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
      >
        <span className="theme-toggle-pill__track">
          <span className="theme-toggle-pill__handle" data-theme={theme}>
            {theme === 'light' ? (
              <svg className="theme-toggle-pill__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg className="theme-toggle-pill__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </span>
        </span>
      </button>
      <div className="card auth-card">
        <h2>Вход</h2>
        <form className="grid auth-form" onSubmit={handleSubmit}>
          <div>
            <input className="input" value={email} onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: '' })) }} placeholder="Email" type="email" required />
            {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
          </div>
          <div>
            <input className="input" value={password} onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: '' })) }} placeholder="Пароль" type="password" required />
            {fieldErrors.password && <div className="form-error">{fieldErrors.password}</div>}
          </div>
          {authMessage && <div className="form-error">{authMessage}</div>}
          {error && <div className="form-error">{error}</div>}
          <button className="btn" type="submit" disabled={loading}>Войти</button>
        </form>
      </div>
    </div>
  )
}
