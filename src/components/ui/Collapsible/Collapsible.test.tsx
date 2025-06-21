import { render, screen } from '@testing-library/react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './Collapsible'

describe('Collapsible', () => {
  it('renders collapsible components correctly', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger data-testid='trigger'>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid='content'>Content</CollapsibleContent>
      </Collapsible>
    )

    expect(screen.getByTestId('trigger')).toBeInTheDocument()
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('applies correct data-slot attributes', () => {
    render(
      <Collapsible data-testid='collapsible'>
        <CollapsibleTrigger data-testid='trigger'>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid='content'>Content</CollapsibleContent>
      </Collapsible>
    )

    expect(screen.getByTestId('collapsible')).toHaveAttribute('data-slot', 'collapsible')
    expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'collapsible-trigger')
    expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'collapsible-content')
  })

  it('can be controlled', () => {
    render(
      <Collapsible open={false}>
        <CollapsibleTrigger data-testid='trigger'>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid='content'>Content</CollapsibleContent>
      </Collapsible>
    )

    const content = screen.getByTestId('content')
    expect(content).toHaveAttribute('data-state', 'closed')
  })

  it('forwards additional props correctly', () => {
    render(
      <Collapsible className='custom-class' data-testid='collapsible'>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    )

    expect(screen.getByTestId('collapsible')).toHaveClass('custom-class')
  })
})
