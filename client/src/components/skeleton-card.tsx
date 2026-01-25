interface SkeletonCardProps {
  lines?: number
}

export function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
  return (
    <div className="skeleton">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton-line" style={{ marginBottom: i < lines - 1 ? 8 : 0 }} />
      ))}
    </div>
  )
}
