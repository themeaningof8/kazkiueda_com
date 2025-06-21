import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Switch } from './Switch'

describe('Switch', () => {
  it('renders switch', () => {
    render(<Switch data-testid='switch' />)
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toHaveRole('switch')
  })

  it('can be toggled', async () => {
    const user = userEvent.setup()
    render(<Switch data-testid='switch' />)

    const switchElement = screen.getByTestId('switch')

    expect(switchElement).toHaveAttribute('data-state', 'unchecked')

    await user.click(switchElement)
    expect(switchElement).toHaveAttribute('data-state', 'checked')

    await user.click(switchElement)
    expect(switchElement).toHaveAttribute('data-state', 'unchecked')
  })

  it('can be disabled', () => {
    render(<Switch disabled data-testid='switch' />)
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toBeDisabled()
  })

  it('can be controlled', async () => {
    const handleCheckedChange = vi.fn()
    render(<Switch checked={false} onCheckedChange={handleCheckedChange} data-testid='switch' />)

    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toHaveAttribute('data-state', 'unchecked')

    const user = userEvent.setup()
    await user.click(switchElement)

    expect(handleCheckedChange).toHaveBeenCalledWith(true)
  })

  it('applies custom className', () => {
    render(<Switch className='custom-class' data-testid='switch' />)
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toHaveClass('custom-class')
  })

  it('has proper ARIA attributes', () => {
    render(<Switch data-testid='switch' />)
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toHaveAttribute('role', 'switch')
    expect(switchElement).toHaveAttribute('aria-checked', 'false')
  })

  it('shows checked state with aria-checked', () => {
    render(<Switch checked data-testid='switch' />)
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toHaveAttribute('aria-checked', 'true')
  })

  it('renders thumb element', () => {
    render(<Switch data-testid='switch' />)
    const switchElement = screen.getByTestId('switch')
    const thumb = switchElement.querySelector('[data-slot="switch-thumb"]')
    expect(thumb).toBeInTheDocument()
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Switch data-testid='switch' />)

    const switchElement = screen.getByTestId('switch')
    switchElement.focus()

    expect(switchElement).toHaveFocus()

    await user.keyboard(' ')
    expect(switchElement).toHaveAttribute('data-state', 'checked')
  })

  it('handles form association', () => {
    render(
      <form>
        <Switch name='test-switch' value='on' data-testid='switch' />
      </form>
    )

    // Radix UIのSwitchでは、内部のinput要素がフォーム属性を持つ
    const hiddenInput = document.querySelector('input[type="checkbox"]')
    expect(hiddenInput).toHaveAttribute('name', 'test-switch')
    expect(hiddenInput).toHaveAttribute('value', 'on')
  })
})
