import type { Meta, StoryObj } from '@storybook/react'

import { Separator } from './Separator'

const meta = {
  title: 'Components/UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'radio' },
      options: ['horizontal', 'vertical'],
    },
    decorative: {
      control: { type: 'boolean' },
    },
    className: {
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className='w-64 p-4'>
      <div className='space-y-1'>
        <h4 className='text-sm font-medium leading-none'>Radix Primitives</h4>
        <p className='text-sm text-muted-foreground'>An open-source UI component library.</p>
      </div>
      <Separator className='my-4' />
      <div className='flex h-5 items-center space-x-4 text-sm'>
        <div>Blog</div>
        <Separator orientation='vertical' />
        <div>Docs</div>
        <Separator orientation='vertical' />
        <div>Source</div>
      </div>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className='flex h-20 items-center space-x-4 text-sm'>
      <div>Blog</div>
      <Separator orientation='vertical' />
      <div>Docs</div>
      <Separator orientation='vertical' />
      <div>Source</div>
    </div>
  ),
}

export const InContent: Story = {
  render: () => (
    <div className='w-96 p-6 border rounded-lg'>
      <div className='space-y-4'>
        <div>
          <h3 className='text-lg font-semibold'>Section 1</h3>
          <p className='text-sm text-muted-foreground'>This is the first section of content.</p>
        </div>
        <Separator />
        <div>
          <h3 className='text-lg font-semibold'>Section 2</h3>
          <p className='text-sm text-muted-foreground'>This is the second section of content.</p>
        </div>
        <Separator />
        <div>
          <h3 className='text-lg font-semibold'>Section 3</h3>
          <p className='text-sm text-muted-foreground'>This is the third section of content.</p>
        </div>
      </div>
    </div>
  ),
}

export const WithCustomStyling: Story = {
  render: () => (
    <div className='w-64 p-4'>
      <div className='space-y-3'>
        <p>Default separator</p>
        <Separator />
        <p>Thicker separator</p>
        <Separator className='h-[2px]' />
        <p>Colored separator</p>
        <Separator className='bg-red-500' />
        <p>Dashed separator</p>
        <Separator className='border-t border-dashed bg-transparent' />
      </div>
    </div>
  ),
}
