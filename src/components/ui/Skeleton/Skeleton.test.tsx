import { render, screen } from '@testing-library/react'

import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('renders skeleton with default classes', () => {
    render(<Skeleton data-testid='skeleton' />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md')
    expect(skeleton).toHaveAttribute('data-slot', 'skeleton')
  })

  it('applies custom className', () => {
    render(<Skeleton className='h-4 w-48' data-testid='skeleton' />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('h-4', 'w-48')
  })

  it('forwards additional props correctly', () => {
    render(<Skeleton data-testid='skeleton' role='status' />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveAttribute('role', 'status')
  })

  it('renders with children', () => {
    render(
      <Skeleton data-testid='skeleton'>
        <span>Loading...</span>
      </Skeleton>
    )
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
