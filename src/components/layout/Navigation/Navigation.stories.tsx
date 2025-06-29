import type { Meta, StoryObj } from '@storybook/react-vite'

import Navigation from './Navigation'

const meta = {
  title: 'Components/Layout/Navigation',
  component: Navigation,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Navigation>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
