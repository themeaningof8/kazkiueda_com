import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button } from '../Button'
import { Popover, PopoverContent, PopoverTrigger } from './Popover'

describe('Popover', () => {
  it('renders popover trigger', () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p>Popover content</p>
        </PopoverContent>
      </Popover>
    )

    expect(screen.getByText('Open popover')).toBeInTheDocument()
  })

  it('opens popover when trigger is clicked', async () => {
    const user = userEvent.setup()

    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p>Popover content</p>
        </PopoverContent>
      </Popover>
    )

    const trigger = screen.getByText('Open popover')
    await user.click(trigger)

    expect(screen.getByText('Popover content')).toBeInTheDocument()
  })

  it('can be controlled', () => {
    render(
      <Popover open>
        <PopoverTrigger asChild>
          <Button>Trigger</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p>Content</p>
        </PopoverContent>
      </Popover>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies custom className to content', async () => {
    const user = userEvent.setup()

    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent className='custom-popover'>
          <p>Content</p>
        </PopoverContent>
      </Popover>
    )

    const trigger = screen.getByText('Open')
    await user.click(trigger)

    const content = screen.getByText('Content').closest('[data-slot="popover-content"]')
    expect(content).toHaveClass('custom-popover')
  })
})
