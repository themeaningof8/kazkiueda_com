import type { Meta, StoryObj } from '@storybook/react'

import { ScrollArea } from './ScrollArea'

const meta = {
  title: 'Components/UI/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ScrollArea className='h-72 w-48 rounded-md border'>
      <div className='p-4'>
        <h4 className='mb-4 text-sm font-medium leading-none'>Tags</h4>
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className='text-sm'
            style={{
              padding: '4px 0',
            }}
          >
            Tag {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className='w-96 whitespace-nowrap rounded-md border'>
      <div className='flex w-max space-x-4 p-4'>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className='shrink-0'>
            <div className='overflow-hidden rounded-md'>
              <div className='h-24 w-[150px] bg-muted flex items-center justify-center'>
                Image {i + 1}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const LongContent: Story = {
  render: () => (
    <ScrollArea className='h-[200px] w-[350px] rounded-md border p-4'>
      <div className='space-y-4'>
        <h4 className='text-sm font-medium'>Privacy Policy</h4>
        <p className='text-sm text-muted-foreground'>
          This is a sample privacy policy. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p className='text-sm text-muted-foreground'>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
          deserunt mollit anim id est laborum.
        </p>
        <p className='text-sm text-muted-foreground'>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
          laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
          architecto beatae vitae dicta sunt explicabo.
        </p>
      </div>
    </ScrollArea>
  ),
}
