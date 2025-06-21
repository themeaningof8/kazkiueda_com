import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { RadioGroup, RadioGroupItem } from './RadioGroup'

describe('RadioGroup', () => {
  it('renders radio group correctly', () => {
    render(
      <RadioGroup data-testid='radio-group'>
        <RadioGroupItem value='option1' data-testid='item1' />
        <RadioGroupItem value='option2' data-testid='item2' />
      </RadioGroup>
    )

    expect(screen.getByTestId('radio-group')).toBeInTheDocument()
    expect(screen.getByTestId('item1')).toBeInTheDocument()
    expect(screen.getByTestId('item2')).toBeInTheDocument()
  })

  it('applies correct data-slot attributes', () => {
    render(
      <RadioGroup data-testid='radio-group'>
        <RadioGroupItem value='option1' data-testid='item1' />
      </RadioGroup>
    )

    expect(screen.getByTestId('radio-group')).toHaveAttribute('data-slot', 'radio-group')
    expect(screen.getByTestId('item1')).toHaveAttribute('data-slot', 'radio-group-item')
  })

  it('can be controlled', () => {
    render(
      <RadioGroup value='option2' data-testid='radio-group'>
        <RadioGroupItem value='option1' data-testid='item1' />
        <RadioGroupItem value='option2' data-testid='item2' />
      </RadioGroup>
    )

    expect(screen.getByTestId('item2')).toHaveAttribute('data-state', 'checked')
    expect(screen.getByTestId('item1')).toHaveAttribute('data-state', 'unchecked')
  })

  it('handles selection changes', () => {
    const handleValueChange = vi.fn()
    render(
      <RadioGroup onValueChange={handleValueChange}>
        <RadioGroupItem value='option1' data-testid='item1' />
        <RadioGroupItem value='option2' data-testid='item2' />
      </RadioGroup>
    )

    fireEvent.click(screen.getByTestId('item1'))
    expect(handleValueChange).toHaveBeenCalledWith('option1')
  })

  it('applies custom className', () => {
    render(
      <RadioGroup className='custom-class' data-testid='radio-group'>
        <RadioGroupItem value='option1' />
      </RadioGroup>
    )

    expect(screen.getByTestId('radio-group')).toHaveClass('custom-class')
  })
})
