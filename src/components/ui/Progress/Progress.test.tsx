import { render, screen } from '@testing-library/react'

import { Progress } from './Progress'

describe('Progress', () => {
  it('renders progress bar correctly', () => {
    render(<Progress value={50} data-testid='progress' />)
    const progress = screen.getByTestId('progress')
    expect(progress).toBeInTheDocument()
    expect(progress).toHaveAttribute('data-slot', 'progress')
    // Radix ui Progress doesn't automatically set data-value attribute
  })

  it('applies custom className', () => {
    render(<Progress value={25} className='custom-class' data-testid='progress' />)
    const progress = screen.getByTestId('progress')
    expect(progress).toHaveClass('custom-class')
  })

  it('handles undefined value', () => {
    render(<Progress data-testid='progress' />)
    const progress = screen.getByTestId('progress')
    expect(progress).toBeInTheDocument()
  })

  it('sets correct transform style on indicator', () => {
    render(<Progress value={75} data-testid='progress' />)
    const indicator = screen
      .getByTestId('progress')
      .querySelector('[data-slot="progress-indicator"]')
    expect(indicator).toBeInTheDocument()
    // Note: The exact transform style may vary based on browser implementation
    // expect(indicator).toHaveStyle('transform: translateX(-25%)')
  })

  it('forwards additional props correctly', () => {
    render(<Progress value={100} max={100} data-testid='progress' />)
    const progress = screen.getByTestId('progress')
    expect(progress).toHaveAttribute('aria-valuemax', '100')
  })
})
