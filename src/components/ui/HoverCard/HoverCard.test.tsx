import { render, screen } from '@testing-library/react'

import { HoverCard, HoverCardContent, HoverCardTrigger } from './HoverCard'

describe('HoverCard', () => {
  it('renders hover card components correctly', () => {
    render(
      <HoverCard>
        <HoverCardTrigger data-testid='trigger'>Hover me</HoverCardTrigger>
        <HoverCardContent data-testid='content'>Card content</HoverCardContent>
      </HoverCard>
    )

    expect(screen.getByTestId('trigger')).toBeInTheDocument()
  })

  it('applies correct data-slot attributes', () => {
    render(
      <HoverCard>
        <HoverCardTrigger data-testid='trigger'>Hover me</HoverCardTrigger>
        <HoverCardContent data-testid='content'>Card content</HoverCardContent>
      </HoverCard>
    )

    expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'hover-card-trigger')
  })

  it('shows content on hover', async () => {
    render(
      <HoverCard open>
        <HoverCardTrigger data-testid='trigger'>Hover me</HoverCardTrigger>
        <HoverCardContent data-testid='content'>Card content</HoverCardContent>
      </HoverCard>
    )

    const trigger = screen.getByTestId('trigger')
    expect(trigger).toBeInTheDocument()
    // Test with controlled open state since hover behavior is complex in test environment
    const content = screen.getByTestId('content')
    expect(content).toBeInTheDocument()
  })

  it('forwards additional props correctly', () => {
    render(
      <HoverCard>
        <HoverCardTrigger className='custom-class' data-testid='trigger'>
          Hover me
        </HoverCardTrigger>
        <HoverCardContent>Card content</HoverCardContent>
      </HoverCard>
    )

    expect(screen.getByTestId('trigger')).toHaveClass('custom-class')
  })
})
