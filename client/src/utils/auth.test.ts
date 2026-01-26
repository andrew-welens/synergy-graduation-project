import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAuth } from './auth'
import { authApi } from '../services/auth'

vi.mock('../services/auth')

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.setState({
      isAuthenticated: false,
      initialized: false,
      loading: false,
      error: null,
      role: null,
      userId: null
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have initial state', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.initialized).toBe(false)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should login successfully', async () => {
    const mockResponse = {
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { id: 'user-1', email: 'test@example.com', role: 'admin' as const, permissions: [] }
    }
    vi.mocked(authApi.login).mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.role).toBe('admin')
    expect(result.current.userId).toBe('user-1')
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle login error', async () => {
    const error = new Error('Invalid credentials')
    vi.mocked(authApi.login).mockRejectedValueOnce(error)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login('test@example.com', 'wrong')
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBe('Invalid credentials')
    expect(result.current.loading).toBe(false)
  })

  it('should logout successfully', async () => {
    vi.mocked(authApi.logout).mockResolvedValueOnce({ ok: true })

    useAuth.setState({
      isAuthenticated: true,
      role: 'admin',
      userId: 'user-1'
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.role).toBeNull()
    expect(result.current.userId).toBeNull()
  })

  it('should ensure authentication on refresh success', async () => {
    const mockResponse = {
      accessToken: 'token',
      user: { id: 'user-1', email: 'test@example.com', role: 'manager' as const, permissions: [] }
    }
    vi.mocked(authApi.refresh).mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.ensure()
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.role).toBe('manager')
    expect(result.current.userId).toBe('user-1')
    expect(result.current.initialized).toBe(true)
  })

  it('should handle ensure authentication failure', async () => {
    vi.mocked(authApi.refresh).mockRejectedValueOnce(new Error('Unauthorized'))

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.ensure()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.initialized).toBe(true)
  })

  it('should not call ensure twice', async () => {
    const mockResponse = {
      accessToken: 'token',
      user: { id: 'user-1', email: 'test@example.com', role: 'admin' as const, permissions: [] }
    }
    vi.mocked(authApi.refresh).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.ensure()
    })

    await act(async () => {
      await result.current.ensure()
    })

    expect(authApi.refresh).toHaveBeenCalledTimes(1)
  })
})
