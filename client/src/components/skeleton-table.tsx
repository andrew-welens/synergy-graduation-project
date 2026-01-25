interface SkeletonTableProps {
  rows?: number
  cols?: number
}

export function SkeletonTable({ rows = 5, cols = 5 }: SkeletonTableProps) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <div className="skeleton-line" style={{ height: 16, width: '60%' }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: cols }).map((_, colIdx) => (
                <td key={colIdx}>
                  <div className="skeleton-line" style={{ height: 14, width: colIdx === 0 ? '80%' : '60%' }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
