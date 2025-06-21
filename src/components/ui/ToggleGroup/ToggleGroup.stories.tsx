import type { Meta, StoryObj } from '@storybook/react'
import { Bold, Italic, Underline } from 'lucide-react'

import { ToggleGroup, ToggleGroupItem } from './ToggleGroup'

const meta = {
  title: 'Components/UI/ToggleGroup',
  component: ToggleGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['single', 'multiple'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof ToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  args: {
    type: 'single',
  },
  render: args => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value='bold' aria-label='Toggle bold'>
        <Bold className='h-4 w-4' />
      </ToggleGroupItem>
      <ToggleGroupItem value='italic' aria-label='Toggle italic'>
        <Italic className='h-4 w-4' />
      </ToggleGroupItem>
      <ToggleGroupItem value='underline' aria-label='Toggle underline'>
        <Underline className='h-4 w-4' />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Multiple: Story = {
  args: {
    type: 'multiple',
  },
  render: args => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value='bold' aria-label='Toggle bold'>
        <Bold className='h-4 w-4' />
      </ToggleGroupItem>
      <ToggleGroupItem value='italic' aria-label='Toggle italic'>
        <Italic className='h-4 w-4' />
      </ToggleGroupItem>
      <ToggleGroupItem value='underline' aria-label='Toggle underline'>
        <Underline className='h-4 w-4' />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const WithText: Story = {
  args: {
    type: 'single',
  },
  render: args => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value='left'>Left</ToggleGroupItem>
      <ToggleGroupItem value='center'>Center</ToggleGroupItem>
      <ToggleGroupItem value='right'>Right</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Disabled: Story = {
  args: {
    type: 'single',
    disabled: true,
  },
  render: args => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value='bold' aria-label='Toggle bold'>
        <Bold className='h-4 w-4' />
      </ToggleGroupItem>
      <ToggleGroupItem value='italic' aria-label='Toggle italic'>
        <Italic className='h-4 w-4' />
      </ToggleGroupItem>
      <ToggleGroupItem value='underline' aria-label='Toggle underline'>
        <Underline className='h-4 w-4' />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}
