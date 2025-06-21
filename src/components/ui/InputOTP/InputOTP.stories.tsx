import type { Meta, StoryObj } from '@storybook/react'

import { useState } from 'react'

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './InputOTP'

const meta: Meta<typeof InputOTP> = {
  title: 'Components/UI/InputOTP',
  component: InputOTP,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<any>

export const Default: Story = {
  args: {},
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div className='space-y-4'>
        <InputOTP maxLength={6} value={value} onChange={setValue}>
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
        <div className='text-center text-sm text-muted-foreground'>入力値: {value}</div>
      </div>
    )
  },
}

export const FourDigits: Story = {
  args: {},
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div className='space-y-4'>
        <InputOTP maxLength={4} value={value} onChange={setValue}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
        <div className='text-center text-sm text-muted-foreground'>4桁のPIN: {value}</div>
      </div>
    )
  },
}

export const WithSeparators: Story = {
  args: {},
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div className='space-y-4'>
        <InputOTP maxLength={8} value={value} onChange={setValue}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={6} />
            <InputOTPSlot index={7} />
          </InputOTPGroup>
        </InputOTP>
        <div className='text-center text-sm text-muted-foreground'>セパレータ付き: {value}</div>
      </div>
    )
  },
}

export const Disabled: Story = {
  args: {},
  render: () => (
    <div className='space-y-4'>
      <InputOTP maxLength={6} disabled value='123456'>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <div className='text-center text-sm text-muted-foreground'>無効状態</div>
    </div>
  ),
}
