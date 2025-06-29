import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './InputOTP'

describe('InputOTP Component Family', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

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

    it('applies custom className', () => {
      const { container } = render(
        <InputOTP maxLength={4} className='custom-otp'>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
          </InputOTPGroup>
        </InputOTP>
      )
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
    it('renders slot', () => {
      render(
        <InputOTP maxLength={1}>
          <InputOTPGroup>
            <InputOTPSlot index={0} data-testid='slot' />
          </InputOTPGroup>
        </InputOTP>
      )
      expect(screen.getByTestId('slot')).toBeInTheDocument()
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
  })

  describe('InputOTPSeparator', () => {
    it('renders separator', () => {
      render(<InputOTPSeparator data-testid='separator' />)
      expect(screen.getByTestId('separator')).toBeInTheDocument()
    })

    it('applies custom props', () => {
      render(<InputOTPSeparator data-testid='separator' id='custom-id' />)
      const separator = screen.getByTestId('separator')
      expect(separator).toHaveAttribute('id', 'custom-id')
    })
  })
})
