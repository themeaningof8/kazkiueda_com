import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '../Label'
import { RadioGroup, RadioGroupItem } from './RadioGroup'

const meta = {
  title: 'Components/UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'text' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue='option-one'>
      <div className='flex items-center space-x-2'>
        <RadioGroupItem value='option-one' id='option-one' />
        <Label htmlFor='option-one'>Option One</Label>
      </div>
      <div className='flex items-center space-x-2'>
        <RadioGroupItem value='option-two' id='option-two' />
        <Label htmlFor='option-two'>Option Two</Label>
      </div>
    </RadioGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue='option-one' disabled>
      <div className='flex items-center space-x-2'>
        <RadioGroupItem value='option-one' id='option-one' />
        <Label htmlFor='option-one'>Option One</Label>
      </div>
      <div className='flex items-center space-x-2'>
        <RadioGroupItem value='option-two' id='option-two' />
        <Label htmlFor='option-two'>Option Two</Label>
      </div>
    </RadioGroup>
  ),
}

export const WithDescriptions: Story = {
  render: () => (
    <RadioGroup defaultValue='comfortable' className='space-y-4'>
      <div className='flex items-center space-x-2'>
        <RadioGroupItem value='default' id='default' />
        <div className='grid gap-1.5 leading-none'>
          <Label htmlFor='default'>Default</Label>
          <p className='text-xs text-muted-foreground'>The default option for most users.</p>
        </div>
      </div>
      <div className='flex items-center space-x-2'>
        <RadioGroupItem value='comfortable' id='comfortable' />
        <div className='grid gap-1.5 leading-none'>
          <Label htmlFor='comfortable'>Comfortable</Label>
          <p className='text-xs text-muted-foreground'>
            A more spacious layout for better readability.
          </p>
        </div>
      </div>
      <div className='flex items-center space-x-2'>
        <RadioGroupItem value='compact' id='compact' />
        <div className='grid gap-1.5 leading-none'>
          <Label htmlFor='compact'>Compact</Label>
          <p className='text-xs text-muted-foreground'>A denser layout to fit more content.</p>
        </div>
      </div>
    </RadioGroup>
  ),
}

export const FormExample: Story = {
  render: () => (
    <form className='space-y-6'>
      <div className='space-y-2'>
        <Label className='text-base font-medium'>Choose your notification preference</Label>
        <RadioGroup defaultValue='email' className='space-y-2'>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='email' id='email' />
            <Label htmlFor='email'>Email notifications</Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='sms' id='sms' />
            <Label htmlFor='sms'>SMS notifications</Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='push' id='push' />
            <Label htmlFor='push'>Push notifications</Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='none' id='none' />
            <Label htmlFor='none'>No notifications</Label>
          </div>
        </RadioGroup>
      </div>
    </form>
  ),
}
