import { render, screen } from '@testing-library/react'

import { Separator } from './Separator'

describe('Separator', () => {
  it('renders horizontal separator by default', () => {
    render(<Separator data-testid='separator' />)
    const separator = screen.getByTestId('separator')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveClass(
      'bg-border',
      'shrink-0',
      'data-[orientation=horizontal]:h-px',
      'data-[orientation=horizontal]:w-full'
    )
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('renders vertical separator when orientation is vertical', () => {
    render(<Separator orientation='vertical' data-testid='separator' />)
    const separator = screen.getByTestId('separator')
    expect(separator).toHaveClass(
      'bg-border',
      'shrink-0',
      'data-[orientation=vertical]:h-full',
      'data-[orientation=vertical]:w-px'
    )
    expect(separator).toHaveAttribute('data-orientation', 'vertical')
  })

  it('applies custom className', () => {
    render(<Separator className='my-4' data-testid='separator' />)
    const separator = screen.getByTestId('separator')
    expect(separator).toHaveClass('my-4')
  })

  it('sets decorative prop correctly', () => {
    render(<Separator decorative={false} data-testid='separator' />)
    const separator = screen.getByTestId('separator')
    expect(separator).not.toHaveAttribute('aria-hidden')
  })

  it('forwards additional props correctly', () => {
    render(<Separator role='separator' data-testid='separator' />)
    const separator = screen.getByTestId('separator')
    expect(separator).toHaveAttribute('role', 'separator')
  })
})
