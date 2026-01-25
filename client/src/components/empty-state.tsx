interface EmptyStateProps {
  title?: string
  description?: string
  icon?: 'empty' | 'search' | 'error' | 'no-data'
  action?: React.ReactNode
}

const EmptyIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'search':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
          <path d="M70 70L90 90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        </svg>
      )
    case 'error':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <path d="M45 45L75 75M75 45L45 75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        </svg>
      )
    case 'no-data':
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="40" width="60" height="40" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <path d="M40 50H80M40 60H70M40 70H60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        </svg>
      )
    default:
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" opacity="0.3" />
          <path d="M60 40V60L70 70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        </svg>
      )
  }
}

export function EmptyState({ title, description, icon = 'empty', action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '32px 20px' }}>
        <div style={{ color: 'rgba(148, 163, 184, 0.4)' }}>
          <EmptyIcon type={icon} />
        </div>
        {title && <div style={{ fontSize: 18, fontWeight: 600, color: '#cbd5f5' }}>{title}</div>}
        {description && <div style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', maxWidth: 400 }}>{description}</div>}
        {action && <div style={{ marginTop: 8 }}>{action}</div>}
      </div>
    </div>
  )
}
