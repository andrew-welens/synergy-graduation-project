import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/auth'
import { useTheme } from '../utils/theme'
import { Fragment, useMemo, useState } from 'react'
import { ToastContainer } from './toast-container'
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts'
import { GlobalSearch } from './global-search'

export default function Layout() {
  const logout = useAuth((s) => s.logout)
  const role = useAuth((s) => s.role)
  const theme = useTheme((s) => s.theme)
  const toggleTheme = useTheme((s) => s.toggle)
  const navigate = useNavigate()
  const location = useLocation()
  const onLogout = () => {
    logout()
    navigate('/login')
  }

  const [isNavOpen, setIsNavOpen] = useState(false)
  const canReadCatalog = role === 'admin' || role === 'manager' || role === 'operator'
  const canReadReports = role === 'admin' || role === 'manager' || role === 'analyst'
  const canReadAudit = role === 'admin' || role === 'analyst'
  const canManageUsers = role === 'admin'
  const nav = [
    { to: '/', label: 'Главная', match: (path: string) => path === '/' },
    { to: '/clients', label: 'Клиенты', match: (path: string) => path.startsWith('/clients') },
    { to: '/orders', label: 'Заказы', match: (path: string) => path.startsWith('/orders') },
    ...(canReadCatalog ? [{ to: '/catalog', label: 'Каталог', match: (path: string) => path.startsWith('/catalog') }] : []),
    ...(canReadReports ? [{ to: '/reports', label: 'Отчеты', match: (path: string) => path.startsWith('/reports') }] : []),
    ...(canReadAudit ? [{ to: '/audit', label: 'Аудит', match: (path: string) => path.startsWith('/audit') }] : []),
    ...(canManageUsers ? [{ to: '/users', label: 'Пользователи', match: (path: string) => path.startsWith('/users') }] : []),
    { to: '/profile', label: 'Профиль', match: (path: string) => path.startsWith('/profile') }
  ]


  const pageMeta = useMemo(() => {
    const path = location.pathname
    const base = [{ label: 'Главная', to: '/' }]
    const parts = path.split('/').filter(Boolean)
    const orderId = parts[0] === 'orders' && parts[1] ? parts[1] : null
    const clientId = parts[0] === 'clients' && parts[1] ? parts[1] : null

    if (path === '/') {
      return { title: 'Главная', subtitle: 'Обзор показателей и задач', breadcrumbs: [{ label: 'Главная' }] }
    }
    if (path.startsWith('/clients/') && path.includes('/interactions')) {
      return {
        title: 'Взаимодействия',
        subtitle: clientId ? `Клиент ${clientId}` : 'История контактов',
        breadcrumbs: [
          ...base,
          { label: 'Клиенты', to: '/clients' },
          ...(clientId ? [{ label: `Клиент ${clientId}` }] : []),
          { label: 'Взаимодействия' }
        ]
      }
    }
    if (path.startsWith('/clients/')) {
      return {
        title: 'Клиент',
        subtitle: clientId ? `Карточка клиента ${clientId}` : 'Карточка клиента',
        breadcrumbs: [...base, { label: 'Клиенты', to: '/clients' }, ...(clientId ? [{ label: `Клиент ${clientId}` }] : [])]
      }
    }
    if (path.startsWith('/clients')) {
      return { title: 'Клиенты', subtitle: 'Список клиентов и сегментов', breadcrumbs: [...base, { label: 'Клиенты' }] }
    }
    if (path.startsWith('/orders/')) {
      return {
        title: 'Заказ',
        subtitle: orderId ? `Заказ № ${orderId}` : 'Детали заказа',
        breadcrumbs: [...base, { label: 'Заказы', to: '/orders' }, ...(orderId ? [{ label: `Заказ ${orderId}` }] : [])]
      }
    }
    if (path.startsWith('/orders')) {
      return { title: 'Заказы', subtitle: 'Управление заказами и статусами', breadcrumbs: [...base, { label: 'Заказы' }] }
    }
    if (path.startsWith('/catalog')) {
      return { title: 'Каталог', subtitle: 'Товары и категории', breadcrumbs: [...base, { label: 'Каталог' }] }
    }
    if (path.startsWith('/reports')) {
      return { title: 'Отчеты', subtitle: 'Срезы и аналитика', breadcrumbs: [...base, { label: 'Отчеты' }] }
    }
    if (path.startsWith('/audit')) {
      return { title: 'Аудит', subtitle: 'История действий', breadcrumbs: [...base, { label: 'Аудит' }] }
    }
    if (path.startsWith('/users')) {
      return { title: 'Пользователи', subtitle: 'Управление доступом', breadcrumbs: [...base, { label: 'Пользователи' }] }
    }
    if (path.startsWith('/profile')) {
      return { title: 'Профиль', subtitle: 'Настройки учетной записи', breadcrumbs: [...base, { label: 'Профиль' }] }
    }
    return { title: 'Раздел', subtitle: 'Рабочая область', breadcrumbs: [...base, { label: 'Раздел' }] }
  }, [location.pathname])

  useKeyboardShortcuts([
    {
      key: 'Escape',
      handler: () => {
        if (isNavOpen) {
          setIsNavOpen(false)
        }
      }
    }
  ])

  return (
    <div className={`app-shell${isNavOpen ? ' nav-open' : ''}`}>
      {isNavOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Закрыть меню"
          onClick={() => setIsNavOpen(false)}
        />
      )}
      <aside className="sidebar">
        <div className="sidebar-header">
          <button
            type="button"
            className="sidebar-close"
            aria-label="Закрыть меню"
            onClick={() => setIsNavOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="sidebar-brand">
          <span className="sidebar-brand-logo" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 24V8l4 8 4-8 4 8 4-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="16" cy="16" r="3" fill="currentColor" />
            </svg>
          </span>
          <span className="sidebar-brand-text">Скартел CRM</span>
          </div>
        </div>
        <div className="sidebar-search">
          <GlobalSearch />
        </div>
        <nav className="sidebar-nav">
          {nav.map((item) => {
            const active = item.match(location.pathname)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-link${active ? ' active' : ''}`}
                onClick={() => setIsNavOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <div className="content">
        <header className="topbar">
          <div>
            <button
              className="btn secondary topbar-menu"
              type="button"
              onClick={() => setIsNavOpen(true)}
              aria-label="Открыть меню"
            >
              <svg className="topbar-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="breadcrumbs">
              {pageMeta.breadcrumbs.map((item, index) => {
                const isLast = index === pageMeta.breadcrumbs.length - 1
                const hasTo = 'to' in item && item.to
                return (
                  <Fragment key={`${item.label}-${index}`}>
                    {hasTo && !isLast ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
                    {!isLast && <span aria-hidden="true">/</span>}
                  </Fragment>
                )
              })}
            </div>
            <div className="topbar-title">{pageMeta.title}</div>
            {pageMeta.subtitle && <div className="topbar-subtitle">{pageMeta.subtitle}</div>}
          </div>
          <div className="topbar-actions">
            {canReadReports && <Link className="btn secondary topbar-reports" to="/reports">Отчеты</Link>}
            <span className="topbar-role">{role ?? '—'}</span>
            <button
              type="button"
              className="theme-toggle-pill"
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
            <button className="btn secondary" onClick={onLogout}>Выйти</button>
          </div>
        </header>
        <main className="page">
          <Outlet />
        </main>
        <ToastContainer />
      </div>
    </div>
  )
}
