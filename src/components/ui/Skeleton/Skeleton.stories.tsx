import type { Meta, StoryObj } from '@storybook/react-vite'

import { Skeleton } from './Skeleton'

const meta = {
  title: 'Components/UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: 'h-4 w-48',
  },
}

export const Circle: Story = {
  args: {
    className: 'h-12 w-12 rounded-full',
  },
}

export const Card: Story = {
  render: () => (
    <div className='flex items-center space-x-4 p-4 border rounded-lg'>
      <Skeleton className='h-12 w-12 rounded-full' />
      <div className='space-y-2'>
        <Skeleton className='h-4 w-48' />
        <Skeleton className='h-4 w-32' />
      </div>
    </div>
  ),
}

export const List: Story = {
  render: () => (
    <div className='space-y-3 w-80'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='flex items-center space-x-4'>
          <Skeleton className='h-8 w-8 rounded-full' />
          <div className='space-y-2 flex-1'>
            <Skeleton className='h-3 w-full' />
            <Skeleton className='h-3 w-3/4' />
          </div>
        </div>
      ))}
    </div>
  ),
}

export const Article: Story = {
  render: () => (
    <div className='space-y-4 w-96'>
      <Skeleton className='h-48 w-full rounded-lg' />
      <div className='space-y-2'>
        <Skeleton className='h-6 w-3/4' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-2/3' />
      </div>
    </div>
  ),
}
