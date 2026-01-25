import { useEffect, useRef } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const isCtrl = e.ctrlKey
      const isMeta = e.metaKey
      const isShift = e.shiftKey
      const isAlt = e.altKey

      for (const shortcut of shortcutsRef.current) {
        const shortcutKey = shortcut.key.toLowerCase()
        const matchKey = shortcutKey === key || shortcutKey === e.key
        const matchCtrl = shortcut.ctrl === undefined ? true : shortcut.ctrl === isCtrl
        const matchMeta = shortcut.meta === undefined ? true : shortcut.meta === isMeta
        const matchShift = shortcut.shift === undefined ? true : shortcut.shift === isShift
        const matchAlt = shortcut.alt === undefined ? true : shortcut.alt === isAlt

        if (matchKey && matchCtrl && matchMeta && matchShift && matchAlt) {
          const hasModifier = shortcut.ctrl || shortcut.meta || shortcut.shift || shortcut.alt
          if (hasModifier && !isCtrl && !isMeta && !isShift && !isAlt) {
            continue
          }
          e.preventDefault()
          shortcut.handler()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled])
}
