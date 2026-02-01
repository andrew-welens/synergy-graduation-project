import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Protected from './protected'

const mockAuthState = {
  isAuthenticated: false,
  initialized: false,
  ensure: vi.fn().mockResolvedValue(undefined),
  role: null as string | null
}

vi.mock('../utils/auth', () => ({
  useAuth: vi.fn((selector?: any) => {
    if (selector) {
      return selector(mockAuthState)
    }
    return mockAuthState
  })
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">Navigate to {to}</div>,
    useLocation: () => ({ pathname: '/test', search: '' })
  }
})

describe('Protected', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthState.isAuthenticated = false
    mockAuthState.initialized = false
    mockAuthState.role = null
    mockAuthState.ensure = vi.fn().mockResolvedValue(undefined)
  })

  it('should show loading when not initialized', () => {
    mockAuthState.initialized = false

    render(
      <MemoryRouter>
        <Protected>Content</Protected>
      </MemoryRouter>
    )

    expect(screen.getByText('Загрузка данных...')).toBeInTheDocument()
  })

  it('should redirect to login when not authenticated', () => {
    mockAuthState.initialized = true
    mockAuthState.isAuthenticated = false

    render(
      <MemoryRouter>
        <Protected>Content</Protected>
      </MemoryRouter>
    )

    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    expect(screen.getByText('Navigate to /login')).toBeInTheDocument()
  })

  it('should render children when authenticated', () => {
    mockAuthState.initialized = true
    mockAuthState.isAuthenticated = true
    mockAuthState.role = 'admin'

    render(
      <MemoryRouter>
        <Protected>Content</Protected>
      </MemoryRouter>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should redirect to forbidden when role not allowed', () => {
    mockAuthState.initialized = true
    mockAuthState.isAuthenticated = true
    mockAuthState.role = 'operator'

    render(
      <MemoryRouter>
        <Protected roles={['admin', 'manager']}>Content</Protected>
      </MemoryRouter>
    )

    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    expect(screen.getByText('Navigate to /forbidden')).toBeInTheDocument()
  })

  it('should render children when role is allowed', () => {
    mockAuthState.initialized = true
    mockAuthState.isAuthenticated = true
    mockAuthState.role = 'admin'

    render(
      <MemoryRouter>
        <Protected roles={['admin', 'manager']}>Content</Protected>
      </MemoryRouter>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})
