import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast } from './toast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useToast.setState({ items: [] })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have empty items initially', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.items).toEqual([])
  })

  it('should add toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.add({
        type: 'success',
        title: 'Success',
        description: 'Operation completed'
      })
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].type).toBe('success')
    expect(result.current.items[0].title).toBe('Success')
    expect(result.current.items[0].description).toBe('Operation completed')
    expect(result.current.items[0].id).toBeDefined()
  })

  it('should remove toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.add({ type: 'info', title: 'Info' })
    })

    const id = result.current.items[0].id

    act(() => {
      result.current.remove(id)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('should auto-remove toast after timeout', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.add({ type: 'success', title: 'Success' }, 1000)
    })

    expect(result.current.items).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('should not auto-remove toast with timeout 0', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.add({ type: 'error', title: 'Error' }, 0)
    })

    expect(result.current.items).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(result.current.items).toHaveLength(1)
  })

  it('should add multiple toasts', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.add({ type: 'success', title: 'First' })
      result.current.add({ type: 'error', title: 'Second' })
      result.current.add({ type: 'info', title: 'Third' })
    })

    expect(result.current.items).toHaveLength(3)
    expect(result.current.items[0].title).toBe('First')
    expect(result.current.items[1].title).toBe('Second')
    expect(result.current.items[2].title).toBe('Third')
  })
})
