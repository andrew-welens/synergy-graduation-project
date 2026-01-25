interface ProgressBarProps {
  progress: number
  label?: string
  showPercentage?: boolean
}

export function ProgressBar({ progress, label, showPercentage = true }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress))

  return (
    <div className="progress-bar-container">
      {label && <div className="progress-bar-label">{label}</div>}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="progress-bar-percentage">{Math.round(clampedProgress)}%</div>
      )}
    </div>
  )
}
