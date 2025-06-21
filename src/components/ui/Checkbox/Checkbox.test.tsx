import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders checkbox', () => {
    render(<Checkbox data-testid='checkbox' />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toHaveRole('checkbox')
  })

  it('can be checked and unchecked', async () => {
    const user = userEvent.setup()
    render(<Checkbox data-testid='checkbox' />)

    const checkbox = screen.getByTestId('checkbox')

    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(checkbox).toBeChecked()

    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('can be disabled', () => {
    render(<Checkbox disabled data-testid='checkbox' />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('can be controlled', async () => {
    const handleChange = vi.fn()
    render(<Checkbox checked={false} onCheckedChange={handleChange} data-testid='checkbox' />)

    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).not.toBeChecked()

    const user = userEvent.setup()
    await user.click(checkbox)

    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('applies custom className', () => {
    render(<Checkbox className='custom-class' data-testid='checkbox' />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toHaveClass('custom-class')
  })

  it('shows check icon when checked', () => {
    render(<Checkbox checked data-testid='checkbox' />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toBeChecked()
    // Check that the indicator is rendered
    expect(checkbox.querySelector('[data-slot="checkbox-indicator"]')).toBeInTheDocument()
  })
})
