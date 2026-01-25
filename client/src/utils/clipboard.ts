import { useToast } from './toast'

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

export function useCopyToClipboard() {
  const addToast = useToast((state) => state.add)

  return async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      addToast({ type: 'success', title: 'Скопировано', description: `${label} скопирован в буфер обмена` })
    } else {
      addToast({ type: 'error', title: 'Ошибка', description: 'Не удалось скопировать в буфер обмена' })
    }
  }
}
