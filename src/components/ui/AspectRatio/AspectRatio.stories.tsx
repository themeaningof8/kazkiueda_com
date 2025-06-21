import type { Meta, StoryObj } from '@storybook/react'

import { AspectRatio } from './AspectRatio'

const meta = {
  title: 'Components/UI/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    ratio: {
      control: { type: 'number', min: 0.1, max: 10, step: 0.1 },
    },
  },
} satisfies Meta<typeof AspectRatio>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ratio: 16 / 9,
  },
  render: args => (
    <div className='w-96'>
      <AspectRatio {...args}>
        <img
          src='https://via.placeholder.com/800x450'
          alt='Placeholder'
          className='rounded-md object-cover w-full h-full'
        />
      </AspectRatio>
    </div>
  ),
}

export const Square: Story = {
  args: {
    ratio: 1,
  },
  render: args => (
    <div className='w-64'>
      <AspectRatio {...args}>
        <div className='bg-muted rounded-md flex items-center justify-center h-full'>
          <span className='text-muted-foreground'>1:1 Square</span>
        </div>
      </AspectRatio>
    </div>
  ),
}

export const Portrait: Story = {
  args: {
    ratio: 3 / 4,
  },
  render: args => (
    <div className='w-64'>
      <AspectRatio {...args}>
        <div className='bg-muted rounded-md flex items-center justify-center h-full'>
          <span className='text-muted-foreground'>3:4 Portrait</span>
        </div>
      </AspectRatio>
    </div>
  ),
}

export const Wide: Story = {
  args: {
    ratio: 21 / 9,
  },
  render: args => (
    <div className='w-96'>
      <AspectRatio {...args}>
        <div className='bg-muted rounded-md flex items-center justify-center h-full'>
          <span className='text-muted-foreground'>21:9 Ultra Wide</span>
        </div>
      </AspectRatio>
    </div>
  ),
}
