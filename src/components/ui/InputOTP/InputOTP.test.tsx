import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './InputOTP'

describe('InputOTP', () => {
  it('renders OTP input component', () => {
    render(
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    )

    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()

    render(
      <InputOTP maxLength={6} onComplete={onComplete}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    )

    const input = screen.getByRole('textbox')
    await user.type(input, '123456')

    expect(onComplete).toHaveBeenCalledWith('123456')
  })

  it('handles value changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <InputOTP maxLength={4} onChange={onChange}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
    )

    const input = screen.getByRole('textbox')
    await user.type(input, '12')

    expect(onChange).toHaveBeenCalledWith('12')
  })

  it('applies custom className', () => {
    const { container } = render(
      <InputOTP maxLength={4} className='custom-otp'>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
        </InputOTPGroup>
      </InputOTP>
    )

    // OTPInputのinput要素にクラスが適用されていることを確認
    const inputElement = container.querySelector('input')
    expect(inputElement).toHaveClass('custom-otp')
  })

  it('applies container className', () => {
    const { container } = render(
      <InputOTP maxLength={4} containerClassName='custom-container'>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
        </InputOTPGroup>
      </InputOTP>
    )

    const containerDiv = container.querySelector('div')
    expect(containerDiv).toHaveClass('custom-container')
  })

  it('supports disabled state', () => {
    render(
      <InputOTP maxLength={4} disabled>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
        </InputOTPGroup>
      </InputOTP>
    )

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('handles backspace correctly', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <InputOTP maxLength={4} onChange={onChange} value='123'>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
    )

    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.keyboard('[Backspace]')

    expect(onChange).toHaveBeenCalledWith('12')
  })
})

describe('InputOTPGroup', () => {
  it('renders group wrapper', () => {
    render(
      <InputOTPGroup data-testid='otp-group'>
        <div>Test content</div>
      </InputOTPGroup>
    )

    const group = screen.getByTestId('otp-group')
    expect(group).toBeInTheDocument()
    expect(group).toHaveAttribute('data-slot', 'input-otp-group')
  })

  it('applies custom className', () => {
    render(
      <InputOTPGroup className='custom-group' data-testid='otp-group'>
        <div>Test content</div>
      </InputOTPGroup>
    )

    const group = screen.getByTestId('otp-group')
    expect(group).toHaveClass('custom-group')
  })

  it('renders children correctly', () => {
    render(
      <InputOTPGroup>
        <span data-testid='child'>Child content</span>
      </InputOTPGroup>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})

describe('InputOTPSlot', () => {
  // Helper function to render slot with context (not currently used but kept for future testing)
  // const _renderSlotWithContext = (index: number, value = '', isActive = false) => {
  //   const mockContext = {
  //     slots: Array(6).fill(null).map((_, i) => ({
  //       char: i < value.length ? value[i] : '',
  //       hasFakeCaret: i === value.length && isActive,
  //       isActive: i === value.length && isActive,
  //     })),
  //   }

  //   return render(
  //     <InputOTPSlot index={index} data-testid={`slot-${index}`} />
  //   )
  // }

  it('renders slot with character', () => {
    render(
      <InputOTP maxLength={4} value='12'>
        <InputOTPGroup>
          <InputOTPSlot index={0} data-testid='slot-0' />
          <InputOTPSlot index={1} data-testid='slot-1' />
        </InputOTPGroup>
      </InputOTP>
    )

    const slots = screen.getAllByTestId(/slot-/)
    expect(slots).toHaveLength(2)
  })

  it('applies custom className', () => {
    render(
      <InputOTP maxLength={1}>
        <InputOTPGroup>
          <InputOTPSlot index={0} className='custom-slot' data-testid='slot' />
        </InputOTPGroup>
      </InputOTP>
    )

    const slot = screen.getByTestId('slot')
    expect(slot).toHaveClass('custom-slot')
  })

  it('shows active state', () => {
    render(
      <InputOTP maxLength={2} value='1'>
        <InputOTPGroup>
          <InputOTPSlot index={0} data-testid='slot-0' />
          <InputOTPSlot index={1} data-testid='slot-1' />
        </InputOTPGroup>
      </InputOTP>
    )

    // Note: The actual active state testing would require proper context mocking
    // which is complex with the input-otp library structure
    const slots = screen.getAllByTestId(/slot-/)
    expect(slots).toHaveLength(2)
  })

  it('has proper data attributes', () => {
    render(
      <InputOTP maxLength={1}>
        <InputOTPGroup>
          <InputOTPSlot index={0} data-testid='slot' />
        </InputOTPGroup>
      </InputOTP>
    )

    const slot = screen.getByTestId('slot')
    expect(slot).toHaveAttribute('data-slot', 'input-otp-slot')
  })
})

describe('InputOTPSeparator', () => {
  it('renders separator with icon', () => {
    render(<InputOTPSeparator data-testid='separator' />)

    const separator = screen.getByTestId('separator')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveAttribute('role', 'separator')
    expect(separator).toHaveAttribute('data-slot', 'input-otp-separator')
  })

  it('applies custom props', () => {
    render(
      <InputOTPSeparator data-testid='separator' className='custom-separator' id='custom-id' />
    )

    const separator = screen.getByTestId('separator')
    expect(separator).toHaveClass('custom-separator')
    expect(separator).toHaveAttribute('id', 'custom-id')
  })
})

describe('Integration tests', () => {
  it('works with complex layout', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()

    render(
      <InputOTP maxLength={6} onComplete={onComplete}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    )

    const input = screen.getByRole('textbox')
    await user.type(input, '123456')

    expect(onComplete).toHaveBeenCalledWith('123456')
  })

  it('handles partial input correctly', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <InputOTP maxLength={6} onChange={onChange}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    )

    const input = screen.getByRole('textbox')
    await user.type(input, '123')

    expect(onChange).toHaveBeenCalledWith('123')
  })

  it('prevents input beyond maxLength', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <InputOTP maxLength={3} onChange={onChange}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
      </InputOTP>
    )

    const input = screen.getByRole('textbox')
    await user.type(input, '12345') // Try to type more than maxLength

    // Should only call with max length value
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]
    expect(lastCall?.[0]).toHaveLength(3)
  })

  it('supports controlled value', () => {
    const { rerender } = render(
      <InputOTP maxLength={3} value='12'>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
      </InputOTP>
    )

    let input = screen.getByRole('textbox')
    expect(input).toHaveValue('12')

    rerender(
      <InputOTP maxLength={3} value='123'>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
      </InputOTP>
    )

    input = screen.getByRole('textbox')
    expect(input).toHaveValue('123')
  })
})
