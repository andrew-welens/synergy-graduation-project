import { create } from 'zustand'

const STORAGE_KEY = 'theme'
type Theme = 'dark' | 'light'

function readTheme(): Theme {
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'light' ? 'light' : 'dark'
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  localStorage.setItem(STORAGE_KEY, theme)
}

export function initTheme() {
  applyTheme(readTheme())
}

interface ThemeState {
  theme: Theme
  toggle: () => void
}

export const useTheme = create<ThemeState>((set) => ({
  theme: readTheme(),
  toggle: () =>
    set((state) => {
      const next: Theme = state.theme === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return { theme: next }
    })
}))
