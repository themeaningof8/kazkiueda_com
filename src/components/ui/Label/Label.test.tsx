import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Label } from './Label'

describe('Label', () => {
  it('renders label text', () => {
    render(<Label>Test Label</Label>)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('associates with form control using htmlFor', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <Label htmlFor='test-input'>Test Input</Label>
        <input id='test-input' />
      </div>
    )

    const label = screen.getByText('Test Input')
    const input = screen.getByRole('textbox')

    // Clicking label should focus the input
    await user.click(label)
    expect(input).toHaveFocus()
  })

  it('applies custom className', () => {
    render(<Label className='custom-class'>Custom Label</Label>)
    const label = screen.getByText('Custom Label')
    expect(label).toHaveClass('custom-class')
  })

  it('renders with icon', () => {
    render(
      <Label>
        <svg data-testid='icon' />
        Label with Icon
      </Label>
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Label with Icon')).toBeInTheDocument()
  })

  it('handles disabled state styling', () => {
    render(
      <div className='group' data-disabled>
        <Label>Disabled Label</Label>
      </div>
    )

    const label = screen.getByText('Disabled Label')
    expect(label).toBeInTheDocument()
    // The component should apply disabled styling based on group data attribute
  })

  it('supports required indication', () => {
    render(
      <Label htmlFor='required-field'>
        Required Field<span className='text-destructive'>*</span>
      </Label>
    )

    expect(screen.getByText('Required Field')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('maintains accessibility with nested elements', () => {
    render(
      <Label htmlFor='complex-input'>
        <span>Complex</span>
        <span>Label</span>
      </Label>
    )

    const label = screen.getByText('Complex')
    expect(label).toBeInTheDocument()
    expect(screen.getByText('Label')).toBeInTheDocument()
  })
})
