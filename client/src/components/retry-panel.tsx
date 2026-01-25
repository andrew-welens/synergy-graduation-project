export function RetryPanel({ message, onRetry }: { message: string, onRetry: () => void }) {
  return (
    <div className="form-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span>{message}</span>
      <button className="btn secondary" type="button" onClick={onRetry}>Повторить</button>
    </div>
  )
}
