import { FormEvent, useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../utils/auth'
import { useTheme } from '../utils/theme'

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
    await login(email, password)
    sessionStorage.removeItem('authRedirect')
    navigate(from)
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  return (
    <div className="auth-page">
      <button
        type="button"
        className="btn secondary theme-toggle auth-theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
      >
        {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
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
          <button className="btn" type="submit" disabled={loading}>{loading ? '...' : 'Войти'}</button>
        </form>
      </div>
    </div>
  )
}
