import { render, screen } from '@testing-library/react'
import { Star } from 'lucide-react'

import { Badge } from './Badge'

describe('Badge', () => {
  it('renders badge with text', () => {
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('applies variant classes correctly', () => {
    render(<Badge variant='destructive'>Destructive</Badge>)
    const badge = screen.getByText('Destructive')
    expect(badge).toHaveClass('bg-destructive')
  })

  it('supports asChild prop', () => {
    render(
      <Badge asChild>
        <a href='/test'>Link Badge</a>
      </Badge>
    )
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('renders with icon', () => {
    render(
      <Badge>
        <Star data-testid='star-icon' />
        Starred
      </Badge>
    )
    expect(screen.getByTestId('star-icon')).toBeInTheDocument()
    expect(screen.getByText('Starred')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Badge className='custom-class'>Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-class')
  })

  it('renders all variants correctly', () => {
    render(
      <div>
        <Badge variant='default'>Default</Badge>
        <Badge variant='secondary'>Secondary</Badge>
        <Badge variant='destructive'>Destructive</Badge>
        <Badge variant='outline'>Outline</Badge>
      </div>
    )

    expect(screen.getByText('Default')).toHaveClass('bg-primary')
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary')
    expect(screen.getByText('Destructive')).toHaveClass('bg-destructive')
    expect(screen.getByText('Outline')).toHaveClass('text-foreground')
  })

  it('supports ref forwarding', () => {
    const ref = { current: null }
    render(<Badge ref={ref}>Ref Badge</Badge>)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })
})
