import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Pagination } from './pagination'

describe('Pagination', () => {
  it('should not render when totalPages <= 1', () => {
    const { container } = render(
      <Pagination
        page={1}
        totalPages={1}
        total={5}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render pagination controls', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination
        page={2}
        totalPages={5}
        total={50}
        pageSize={10}
        onPageChange={onPageChange}
      />
    )

    expect(screen.getByText('11–20 из 50')).toBeInTheDocument()
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('should call onPageChange when clicking next', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination
        page={1}
        totalPages={5}
        total={50}
        pageSize={10}
        onPageChange={onPageChange}
      />
    )

    const nextButton = screen.getByText('Вперед')
    fireEvent.click(nextButton)

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('should call onPageChange when clicking previous', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination
        page={2}
        totalPages={5}
        total={50}
        pageSize={10}
        onPageChange={onPageChange}
      />
    )

    const prevButton = screen.getByText('Назад')
    fireEvent.click(prevButton)

    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('should disable previous button on first page', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination
        page={1}
        totalPages={5}
        total={50}
        pageSize={10}
        onPageChange={onPageChange}
      />
    )

    const prevButton = screen.getByText('Назад')
    expect(prevButton).toBeDisabled()
  })

  it('should disable next button on last page', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination
        page={5}
        totalPages={5}
        total={50}
        pageSize={10}
        onPageChange={onPageChange}
      />
    )

    const nextButton = screen.getByText('Вперед')
    expect(nextButton).toBeDisabled()
  })

  it('should call onPageSizeChange when changing page size', () => {
    const onPageChange = vi.fn()
    const onPageSizeChange = vi.fn()
    render(
      <Pagination
        page={2}
        totalPages={5}
        total={50}
        pageSize={10}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    )

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '20' } })

    expect(onPageSizeChange).toHaveBeenCalledWith(20)
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('should display correct range for empty results', () => {
    render(
      <Pagination
        page={1}
        totalPages={1}
        total={0}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    )

    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })
})
