import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ToggleGroup, ToggleGroupItem } from './ToggleGroup'

describe('ToggleGroup', () => {
  it('renders toggle group with items', () => {
    render(
      <ToggleGroup type='single'>
        <ToggleGroupItem value='option1'>Option 1</ToggleGroupItem>
        <ToggleGroupItem value='option2'>Option 2</ToggleGroupItem>
        <ToggleGroupItem value='option3'>Option 3</ToggleGroupItem>
      </ToggleGroup>
    )

    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
  })

  it('allows single selection', async () => {
    const user = userEvent.setup()

    render(
      <ToggleGroup type='single'>
        <ToggleGroupItem value='option1'>Option 1</ToggleGroupItem>
        <ToggleGroupItem value='option2'>Option 2</ToggleGroupItem>
      </ToggleGroup>
    )

    const option1 = screen.getByText('Option 1')
    await user.click(option1)

    expect(option1).toHaveAttribute('data-state', 'on')
  })

  it('allows multiple selection', async () => {
    const user = userEvent.setup()

    render(
      <ToggleGroup type='multiple'>
        <ToggleGroupItem value='option1'>Option 1</ToggleGroupItem>
        <ToggleGroupItem value='option2'>Option 2</ToggleGroupItem>
      </ToggleGroup>
    )

    const option1 = screen.getByText('Option 1')
    const option2 = screen.getByText('Option 2')

    await user.click(option1)
    await user.click(option2)

    expect(option1).toHaveAttribute('data-state', 'on')
    expect(option2).toHaveAttribute('data-state', 'on')
  })

  it('can be disabled', () => {
    render(
      <ToggleGroup type='single' disabled>
        <ToggleGroupItem value='option1'>Option 1</ToggleGroupItem>
        <ToggleGroupItem value='option2'>Option 2</ToggleGroupItem>
      </ToggleGroup>
    )

    const option1 = screen.getByText('Option 1')
    expect(option1).toBeDisabled()
  })

  it('applies custom className', () => {
    render(
      <ToggleGroup type='single' className='custom-toggle-group' data-testid='toggle-group'>
        <ToggleGroupItem value='option1'>Option 1</ToggleGroupItem>
      </ToggleGroup>
    )

    const toggleGroup = screen.getByTestId('toggle-group')
    expect(toggleGroup).toHaveClass('custom-toggle-group')
  })
})
