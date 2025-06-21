import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '../Button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip'

const meta = {
  title: 'Components/UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant='outline'>Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const WithDelayDuration: Story = {
  render: () => (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <Button variant='outline'>Fast tooltip</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This tooltip appears quickly</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const WithSideOffset: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant='outline'>Spaced tooltip</Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={20}>
        <p>This tooltip has more space</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const WithCustomStyling: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant='outline'>Custom tooltip</Button>
      </TooltipTrigger>
      <TooltipContent className='bg-red-500 text-white border-red-600'>
        <p>Custom styled tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const MultipleTooltips: Story = {
  render: () => (
    <div className='flex space-x-4'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='outline'>First</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>First tooltip</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='outline'>Second</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Second tooltip</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='outline'>Third</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Third tooltip</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
}

export const WithRichContent: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant='outline'>Rich content</Button>
      </TooltipTrigger>
      <TooltipContent className='max-w-xs'>
        <div className='space-y-2'>
          <h4 className='font-semibold'>Tooltip Title</h4>
          <p className='text-sm'>
            This tooltip contains rich content with multiple elements and longer text.
          </p>
          <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
            <span>•</span>
            <span>Additional info</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
}

export const Positioning: Story = {
  render: () => (
    <div className='grid grid-cols-3 gap-4 p-8'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='outline'>Top</Button>
        </TooltipTrigger>
        <TooltipContent side='top'>
          <p>Top tooltip</p>
        </TooltipContent>
      </Tooltip>

      <div></div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='outline'>Right</Button>
        </TooltipTrigger>
        <TooltipContent side='right'>
          <p>Right tooltip</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='outline'>Left</Button>
        </TooltipTrigger>
        <TooltipContent side='left'>
          <p>Left tooltip</p>
        </TooltipContent>
      </Tooltip>

      <div></div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='outline'>Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>
          <p>Bottom tooltip</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
}
