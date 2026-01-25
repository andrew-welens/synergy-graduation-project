import { type ReactElement } from 'react'
import { useToast } from '../state/toast'

export const ToastContainer = (): ReactElement | null => {
  const items = useToast((state) => state.items)
  const remove = useToast((state) => state.remove)

  if (items.length === 0) return null

  return (
    <div className="toast-container" aria-live="polite">
      {items.map((item) => (
        <div key={item.id} className={`toast toast--${item.type}`}>
          <div className="toast-content">
            <div className="toast-title">{item.title}</div>
            {item.description && <div className="toast-description">{item.description}</div>}
          </div>
          <button className="toast-close" type="button" onClick={() => remove(item.id)}>×</button>
        </div>
      ))}
    </div>
  )
}
