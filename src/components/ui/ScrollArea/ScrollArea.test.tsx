import { render, screen } from '@testing-library/react'

import { ScrollArea } from './ScrollArea'

describe('ScrollArea', () => {
  it('renders scroll area correctly', () => {
    render(
      <ScrollArea data-testid='scroll-area'>
        <div>Content</div>
      </ScrollArea>
    )

    expect(screen.getByTestId('scroll-area')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies correct data-slot attributes', () => {
    render(
      <ScrollArea data-testid='scroll-area'>
        <div>Content</div>
      </ScrollArea>
    )

    expect(screen.getByTestId('scroll-area')).toHaveAttribute('data-slot', 'scroll-area')
  })

  it('applies custom className', () => {
    render(
      <ScrollArea className='custom-class' data-testid='scroll-area'>
        <div>Content</div>
      </ScrollArea>
    )

    expect(screen.getByTestId('scroll-area')).toHaveClass('custom-class')
  })
})
