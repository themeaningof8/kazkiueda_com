import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip'

describe('Tooltip', () => {
  it('renders tooltip content when triggered', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid='tooltip-trigger'>Hover me</TooltipTrigger>
          <TooltipContent data-testid='tooltip-content'>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByTestId('tooltip-trigger')
    expect(trigger).toBeInTheDocument()

    await user.hover(trigger)
    const content = await screen.findByTestId('tooltip-content')
    expect(content).toBeInTheDocument()
    expect(content).toHaveTextContent('Tooltip content')
  })

  it('hides tooltip content when not triggered', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()
  })

  it('applies custom className to content', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid='tooltip-trigger'>Hover me</TooltipTrigger>
          <TooltipContent className='custom-tooltip' data-testid='tooltip-content'>
            Tooltip content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByTestId('tooltip-trigger')
    await user.hover(trigger)

    const content = await screen.findByTestId('tooltip-content')
    expect(content).toHaveClass('custom-tooltip')
  })

  it('supports controlled open state', () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent data-testid='tooltip-content'>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const content = screen.getByTestId('tooltip-content')
    expect(content).toBeInTheDocument()
  })

  it('calls onOpenChange when state changes', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <TooltipProvider>
        <Tooltip onOpenChange={onOpenChange}>
          <TooltipTrigger data-testid='tooltip-trigger'>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByTestId('tooltip-trigger')
    await user.hover(trigger)

    expect(onOpenChange).toHaveBeenCalledWith(true)
  })
})
