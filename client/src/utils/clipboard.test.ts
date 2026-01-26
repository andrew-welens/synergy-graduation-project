import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { copyToClipboard } from './clipboard'

describe('clipboard', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should copy text to clipboard successfully', async () => {
    const text = 'test text'
    const result = await copyToClipboard(text)

    expect(result).toBe(true)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text)
  })

  it('should return false on clipboard error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error('Clipboard error'))

    const result = await copyToClipboard('test')

    expect(result).toBe(false)
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })
})
