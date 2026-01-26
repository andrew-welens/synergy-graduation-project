import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('should render with default props', () => {
    const { container } = render(<EmptyState />)
    expect(container.querySelector('.empty-state')).toBeInTheDocument()
  })

  it('should render with title', () => {
    render(<EmptyState title="No data" />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('should render with description', () => {
    render(<EmptyState description="No items found" />)
    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('should render with action', () => {
    render(
      <EmptyState
        title="Empty"
        action={<button>Create</button>}
      />
    )
    expect(screen.getByText('Empty')).toBeInTheDocument()
    expect(screen.getByText('Create')).toBeInTheDocument()
  })

  it('should render with different icon types', () => {
    const { container, rerender } = render(<EmptyState icon="search" />)
    expect(container.querySelector('.empty-state')).toBeInTheDocument()

    rerender(<EmptyState icon="error" />)
    expect(container.querySelector('.empty-state')).toBeInTheDocument()

    rerender(<EmptyState icon="no-data" />)
    expect(container.querySelector('.empty-state')).toBeInTheDocument()
  })
})
