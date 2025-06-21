import type { Meta, StoryObj } from '@storybook/react'
import { Check, Star, User } from 'lucide-react'

import { Badge } from './Badge'

const meta = {
  title: 'Components/UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
    asChild: {
      control: { type: 'boolean' },
    },
  },
  args: {
    children: 'Badge',
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
}

export const WithIcon: Story = {
  render: () => (
    <div className='flex items-center gap-2'>
      <Badge>
        <Star className='fill-current' />
        お気に入り
      </Badge>
      <Badge variant='secondary'>
        <User />
        ユーザー
      </Badge>
      <Badge variant='destructive'>
        <Check />
        完了
      </Badge>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className='flex flex-wrap gap-2'>
      <Badge variant='default'>Default</Badge>
      <Badge variant='secondary'>Secondary</Badge>
      <Badge variant='destructive'>Destructive</Badge>
      <Badge variant='outline'>Outline</Badge>
    </div>
  ),
}

export const AsLink: Story = {
  args: {
    asChild: true,
    children: <a href='#'>リンクバッジ</a>,
  },
}
