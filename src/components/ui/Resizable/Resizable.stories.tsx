import type { Meta, StoryObj } from '@storybook/react-vite'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './Resizable'

const meta = {
  title: 'Components/UI/Resizable',
  component: ResizablePanelGroup,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ResizablePanelGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  args: {
    direction: 'horizontal',
  },
  render: args => (
    <div className='h-[400px] w-full'>
      <ResizablePanelGroup
        direction={args.direction}
        className='min-h-[200px] max-w-md rounded-lg border'
      >
        <ResizablePanel defaultSize={50}>
          <div className='flex h-full items-center justify-center p-6'>
            <span className='font-semibold'>Panel One</span>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <div className='flex h-full items-center justify-center p-6'>
            <span className='font-semibold'>Panel Two</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}

export const Vertical: Story = {
  args: {
    direction: 'vertical',
  },
  render: args => (
    <div className='h-[400px] w-full'>
      <ResizablePanelGroup
        direction={args.direction}
        className='min-h-[200px] max-w-md rounded-lg border'
      >
        <ResizablePanel defaultSize={25}>
          <div className='flex h-full items-center justify-center p-6'>
            <span className='font-semibold'>Header</span>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={75}>
          <div className='flex h-full items-center justify-center p-6'>
            <span className='font-semibold'>Content</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}

export const WithHandle: Story = {
  args: {
    direction: 'horizontal',
  },
  render: args => (
    <div className='h-[400px] w-full'>
      <ResizablePanelGroup
        direction={args.direction}
        className='min-h-[200px] max-w-md rounded-lg border'
      >
        <ResizablePanel defaultSize={50}>
          <div className='flex h-full items-center justify-center p-6'>
            <span className='font-semibold'>Left Panel</span>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className='flex h-full items-center justify-center p-6'>
            <span className='font-semibold'>Right Panel</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}

export const ThreePanel: Story = {
  args: {
    direction: 'horizontal',
  },
  render: args => (
    <div className='h-[400px] w-full'>
      <ResizablePanelGroup
        direction={args.direction}
        className='min-h-[200px] max-w-md rounded-lg border'
      >
        <ResizablePanel defaultSize={33}>
          <div className='flex h-full items-center justify-center p-6'>
            <span className='font-semibold'>Left</span>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={34}>
          <div className='flex h-full items-center justify-center p-6'>
            <span className='font-semibold'>Center</span>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={33}>
          <div className='flex h-full items-center justify-center p-6'>
            <span className='font-semibold'>Right</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}
