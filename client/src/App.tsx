import { Outlet, RouteObject } from 'react-router-dom'
import { Suspense } from 'react'
import LoginPage from './pages/login'
import ClientsPage from './pages/clients'
import DashboardPage from './pages/dashboard'
import OrdersPage from './pages/orders'
import CatalogPage from './pages/catalog'
import InteractionsPage from './pages/interactions'
import ClientDetailPage from './pages/client-detail'
import OrderDetailPage from './pages/order-detail'
import AuditPage from './pages/audit'
import ReportsPage from './pages/reports'
import UsersPage from './pages/users'
import ForbiddenPage from './pages/forbidden'
import ProfilePage from './pages/profile'
import Layout from './components/layout'
import Protected from './components/protected'

const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Protected>
        <Layout />
      </Protected>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'clients', element: <ClientsPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/:orderId', element: <OrderDetailPage /> },
      { path: 'catalog', element: <CatalogPage /> },
      { path: 'clients/:clientId', element: <ClientDetailPage /> },
      { path: 'clients/:clientId/interactions', element: <InteractionsPage /> },
      { path: 'audit', element: <AuditPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'profile', element: <ProfilePage /> }
    ]
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/forbidden', element: <ForbiddenPage /> },
  { path: '*', element: <Suspense fallback={<div>...</div>}><div>404</div></Suspense> }
]

export default routes
