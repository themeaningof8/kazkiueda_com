import type { Meta, StoryObj } from '@storybook/react-vite'
import { CalendarDays } from 'lucide-react'

import { Avatar, AvatarFallback } from '../Avatar'
import { Button } from '../Button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './HoverCard'

const meta = {
  title: 'Components/UI/HoverCard',
  component: HoverCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HoverCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant='link'>@nextjs</Button>
      </HoverCardTrigger>
      <HoverCardContent className='w-80'>
        <div className='flex justify-between space-x-4'>
          <Avatar>
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className='space-y-1'>
            <h4 className='text-sm font-semibold'>@nextjs</h4>
            <p className='text-sm'>The React Framework – created and maintained by @vercel.</p>
            <div className='flex items-center pt-2'>
              <CalendarDays className='mr-2 h-4 w-4 opacity-70' />{' '}
              <span className='text-xs text-muted-foreground'>Joined December 2021</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
}

export const WithLink: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <a href='#' className='text-blue-600 hover:underline'>
          Learn more
        </a>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className='space-y-2'>
          <h4 className='text-sm font-semibold'>Additional Information</h4>
          <p className='text-sm text-muted-foreground'>
            This is additional information that appears when you hover over the link.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
}

export const UserProfile: Story = {
  render: () => (
    <div className='flex space-x-4'>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant='outline'>John Doe</Button>
        </HoverCardTrigger>
        <HoverCardContent className='w-80'>
          <div className='flex space-x-4'>
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className='space-y-1'>
              <h4 className='text-sm font-semibold'>John Doe</h4>
              <p className='text-sm text-muted-foreground'>
                Full-stack developer with 5 years of experience.
              </p>
              <div className='flex items-center pt-2'>
                <span className='text-xs text-muted-foreground'>Senior Developer at Tech Corp</span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
}
