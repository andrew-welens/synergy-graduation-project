import { type ReactElement } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel
}: ConfirmDialogProps): ReactElement | null => {
  if (!isOpen) return null

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="dialog-card">
        <div className="dialog-title">{title}</div>
        <div className="dialog-description">{description}</div>
        <div className="dialog-actions">
          <button className="btn secondary" type="button" onClick={onCancel}>{cancelLabel}</button>
          <button className="btn" type="button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
