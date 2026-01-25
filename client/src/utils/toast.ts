import { create } from 'zustand'

export type ToastType = 'success' | 'info' | 'warning' | 'error'

export interface ToastItem {
  id: string
  type: ToastType
  title: string
  description?: string
}

interface ToastState {
  items: ToastItem[]
  add: (toast: Omit<ToastItem, 'id'>, timeoutMs?: number) => void
  remove: (id: string) => void
}

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

export const useToast = create<ToastState>((set, get) => ({
  items: [],
  add: (toast, timeoutMs = 3500) => {
    const id = createId()
    set((state) => ({ items: [...state.items, { ...toast, id }] }))
    if (timeoutMs > 0) {
      setTimeout(() => {
        get().remove(id)
      }, timeoutMs)
    }
  },
  remove: (id) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
  }
}))
