import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast } from 'sonner'

import { Button } from '../Button'
import { Toaster } from './Sonner'

const meta = {
  title: 'Components/UI/Sonner',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: { type: 'select' },
      options: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
    },
  },
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button onClick={() => toast('Hello, World!')}>Show Toast</Button>
    </div>
  ),
}

export const Success: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button onClick={() => toast.success('Successfully saved!')}>Success Toast</Button>
    </div>
  ),
}

export const Error: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button onClick={() => toast.error('Something went wrong!')}>Error Toast</Button>
    </div>
  ),
}

export const WithAction: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        onClick={() =>
          toast('Event has been created', {
            action: {
              label: 'Undo',
              onClick: () => console.log('Undo'),
            },
          })
        }
      >
        Toast with Action
      </Button>
    </div>
  ),
}

export const Promise: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        onClick={() => {
          const promise = () =>
            new globalThis.Promise<void>((resolve: () => void) => setTimeout(() => resolve(), 2000))
          toast.promise(promise(), {
            loading: 'Loading...',
            success: 'Data loaded successfully!',
            error: 'Error loading data',
          })
        }}
      >
        Promise Toast
      </Button>
    </div>
  ),
}
