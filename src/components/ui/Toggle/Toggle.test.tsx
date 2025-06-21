import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Toggle } from './Toggle'

describe('Toggle', () => {
  it('renders toggle button', () => {
    render(<Toggle data-testid='toggle'>Toggle</Toggle>)
    const toggle = screen.getByTestId('toggle')
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute('type', 'button')
    expect(toggle).toHaveAttribute('data-state', 'off')
  })

  it('toggles state when clicked', async () => {
    const user = userEvent.setup()
    render(<Toggle data-testid='toggle'>Toggle</Toggle>)
    const toggle = screen.getByTestId('toggle')

    expect(toggle).toHaveAttribute('data-state', 'off')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('data-state', 'on')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('data-state', 'off')
  })

  it('applies variant classes correctly', () => {
    const { rerender } = render(
      <Toggle variant='default' data-testid='toggle'>
        Toggle
      </Toggle>
    )
    let toggle = screen.getByTestId('toggle')
    expect(toggle).toHaveClass('bg-transparent')

    rerender(
      <Toggle variant='outline' data-testid='toggle'>
        Toggle
      </Toggle>
    )
    toggle = screen.getByTestId('toggle')
    expect(toggle).toHaveClass('border', 'border-input')
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(
      <Toggle size='default' data-testid='toggle'>
        Toggle
      </Toggle>
    )
    let toggle = screen.getByTestId('toggle')
    expect(toggle).toHaveClass('h-9', 'px-2', 'min-w-9')

    rerender(
      <Toggle size='sm' data-testid='toggle'>
        Toggle
      </Toggle>
    )
    toggle = screen.getByTestId('toggle')
    expect(toggle).toHaveClass('h-8', 'px-1.5', 'min-w-8')

    rerender(
      <Toggle size='lg' data-testid='toggle'>
        Toggle
      </Toggle>
    )
    toggle = screen.getByTestId('toggle')
    expect(toggle).toHaveClass('h-10', 'px-2.5', 'min-w-10')
  })

  it('applies custom className', () => {
    render(
      <Toggle className='custom-class' data-testid='toggle'>
        Toggle
      </Toggle>
    )
    const toggle = screen.getByTestId('toggle')
    expect(toggle).toHaveClass('custom-class')
  })

  it('supports pressed state', () => {
    render(
      <Toggle pressed data-testid='toggle'>
        Toggle
      </Toggle>
    )
    const toggle = screen.getByTestId('toggle')
    expect(toggle).toHaveAttribute('data-state', 'on')
  })

  it('calls onPressedChange when clicked', async () => {
    const onPressedChange = vi.fn()
    const user = userEvent.setup()

    render(
      <Toggle onPressedChange={onPressedChange} data-testid='toggle'>
        Toggle
      </Toggle>
    )
    const toggle = screen.getByTestId('toggle')

    await user.click(toggle)
    expect(onPressedChange).toHaveBeenCalledWith(true)
  })

  it('is disabled when disabled prop is true', () => {
    render(
      <Toggle disabled data-testid='toggle'>
        Toggle
      </Toggle>
    )
    const toggle = screen.getByTestId('toggle')
    expect(toggle).toBeDisabled()
    expect(toggle).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
  })
})
