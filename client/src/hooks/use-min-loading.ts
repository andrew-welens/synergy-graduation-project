import { useCallback, useEffect, useRef, useState } from 'react'

export function useMinLoading(minDurationMs = 750) {
  const [loading, setLoading] = useState(false)
  const startedAtRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const startLoading = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    startedAtRef.current = Date.now()
    setLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    const startedAt = startedAtRef.current
    const elapsed = startedAt ? Date.now() - startedAt : 0
    const remaining = minDurationMs - elapsed
    if (remaining <= 0) {
      setLoading(false)
      return
    }
    timeoutRef.current = window.setTimeout(() => {
      setLoading(false)
      timeoutRef.current = null
    }, remaining)
  }, [minDurationMs])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])

  return { loading, startLoading, stopLoading }
}
