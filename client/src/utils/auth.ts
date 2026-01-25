import { create } from 'zustand'
import { authApi } from '../services/auth'
import { type Role } from '../services/types'

interface AuthState {
  isAuthenticated: boolean
  initialized: boolean
  loading: boolean
  error: string | null
  role: Role | null
  userId: string | null
  ensure: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuth = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  initialized: false,
  loading: false,
  error: null,
  role: null,
  userId: null,
  async ensure() {
    if (get().initialized) return
    try {
      await authApi.refresh()
      try {
        const me = await authApi.me()
        set({ isAuthenticated: true, initialized: true, role: me.role as Role, userId: me.id })
      } catch {
        set({ isAuthenticated: true, initialized: true, role: null, userId: null })
      }
    } catch {
      set({ isAuthenticated: false, initialized: true, role: null, userId: null })
    }
  },
  async login(email, password) {
    set({ loading: true, error: null })
    try {
      await authApi.login(email, password)
      try {
        const me = await authApi.me()
        set({ isAuthenticated: true, initialized: true, loading: false, role: me.role as Role, userId: me.id })
      } catch {
        set({ isAuthenticated: true, initialized: true, loading: false, role: null, userId: null })
      }
    } catch (e) {
      set({ error: (e as Error).message, loading: false, isAuthenticated: false, initialized: true, role: null, userId: null })
    }
  },
  async logout() {
    try {
      await authApi.logout()
    } finally {
      set({ isAuthenticated: false, initialized: true, role: null, userId: null })
    }
  }
}))
