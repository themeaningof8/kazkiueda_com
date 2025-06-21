import type { Meta, StoryObj } from '@storybook/react'
import { Bold, Italic, Underline } from 'lucide-react'

import { Toggle } from './Toggle'

const meta = {
  title: 'Components/UI/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'outline'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg'],
    },
    pressed: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Toggle',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Toggle',
  },
}

export const Pressed: Story = {
  args: {
    pressed: true,
    children: 'Toggle',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Toggle',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Toggle',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Toggle',
  },
}

export const WithIcon: Story = {
  args: {
    children: <Bold className='h-4 w-4' />,
  },
}

export const FormattingToolbar: Story = {
  render: () => (
    <div className='flex items-center space-x-1 p-4 border rounded-lg'>
      <Toggle aria-label='Toggle bold'>
        <Bold className='h-4 w-4' />
      </Toggle>
      <Toggle aria-label='Toggle italic'>
        <Italic className='h-4 w-4' />
      </Toggle>
      <Toggle aria-label='Toggle underline'>
        <Underline className='h-4 w-4' />
      </Toggle>
    </div>
  ),
}

export const VariantComparison: Story = {
  render: () => (
    <div className='flex items-center space-x-4 p-4'>
      <div className='space-y-2'>
        <p className='text-sm font-medium'>Default</p>
        <Toggle>Toggle</Toggle>
      </div>
      <div className='space-y-2'>
        <p className='text-sm font-medium'>Outline</p>
        <Toggle variant='outline'>Toggle</Toggle>
      </div>
    </div>
  ),
}

export const SizeComparison: Story = {
  render: () => (
    <div className='flex items-center space-x-4 p-4'>
      <div className='space-y-2'>
        <p className='text-sm font-medium'>Small</p>
        <Toggle size='sm'>Sm</Toggle>
      </div>
      <div className='space-y-2'>
        <p className='text-sm font-medium'>Default</p>
        <Toggle size='default'>Default</Toggle>
      </div>
      <div className='space-y-2'>
        <p className='text-sm font-medium'>Large</p>
        <Toggle size='lg'>Large</Toggle>
      </div>
    </div>
  ),
}
