interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange, onPageSizeChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(total, page * pageSize)

  return (
    <div className="pagination">
      <span className="text-muted">
        {total === 0 ? '0' : `${start}–${end} из ${total}`}
      </span>
      <div className="actions-row">
        <button className="btn secondary" type="button" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>Назад</button>
        <span className="text-muted">{page} / {totalPages}</span>
        <button className="btn secondary" type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Вперед</button>
      </div>
      {onPageSizeChange && (
        <select
          className="input"
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value))
            onPageChange(1)
          }}
        >
          <option value={10}>10 / стр</option>
          <option value={20}>20 / стр</option>
          <option value={50}>50 / стр</option>
        </select>
      )}
    </div>
  )
}
