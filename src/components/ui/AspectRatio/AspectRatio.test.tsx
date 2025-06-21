import { render, screen } from '@testing-library/react'

import { AspectRatio } from './AspectRatio'

describe('AspectRatio', () => {
  it('renders aspect ratio container correctly', () => {
    render(
      <AspectRatio ratio={16 / 9} data-testid='aspect-ratio'>
        <img src='/test.jpg' alt='Test' />
      </AspectRatio>
    )
    const container = screen.getByTestId('aspect-ratio')
    expect(container).toBeInTheDocument()
    expect(container).toHaveAttribute('data-slot', 'aspect-ratio')
  })

  it('accepts custom ratio prop', () => {
    render(
      <AspectRatio ratio={1} data-testid='square-ratio'>
        <div>Square content</div>
      </AspectRatio>
    )
    const container = screen.getByTestId('square-ratio')
    expect(container).toBeInTheDocument()
  })

  it('forwards additional props correctly', () => {
    render(
      <AspectRatio className='custom-class' data-testid='custom-aspect'>
        <div>Content</div>
      </AspectRatio>
    )
    const container = screen.getByTestId('custom-aspect')
    expect(container).toHaveClass('custom-class')
  })
})
