import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMinLoading } from './use-min-loading'

describe('useMinLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should start with loading false', () => {
    const { result } = renderHook(() => useMinLoading())
    expect(result.current.loading).toBe(false)
  })

  it('should set loading to true when startLoading is called', () => {
    const { result } = renderHook(() => useMinLoading())
    
    act(() => {
      result.current.startLoading()
    })

    expect(result.current.loading).toBe(true)
  })

  it('should maintain loading for minimum duration', () => {
    const { result } = renderHook(() => useMinLoading(500))

    act(() => {
      result.current.startLoading()
    })
    expect(result.current.loading).toBe(true)

    act(() => {
      vi.advanceTimersByTime(200)
      result.current.stopLoading()
    })
    expect(result.current.loading).toBe(true)

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.loading).toBe(false)
  })

  it('should stop loading immediately if duration exceeded', () => {
    const { result } = renderHook(() => useMinLoading(500))

    act(() => {
      result.current.startLoading()
    })

    act(() => {
      vi.advanceTimersByTime(600)
      result.current.stopLoading()
    })

    expect(result.current.loading).toBe(false)
  })

  it('should handle multiple start/stop calls', () => {
    const { result } = renderHook(() => useMinLoading(300))

    act(() => {
      result.current.startLoading()
    })
    expect(result.current.loading).toBe(true)

    act(() => {
      vi.advanceTimersByTime(100)
      result.current.stopLoading()
    })
    expect(result.current.loading).toBe(true)

    act(() => {
      result.current.startLoading()
    })
    expect(result.current.loading).toBe(true)

    act(() => {
      vi.advanceTimersByTime(200)
      result.current.stopLoading()
    })
    expect(result.current.loading).toBe(true)

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.loading).toBe(false)
  })
})
