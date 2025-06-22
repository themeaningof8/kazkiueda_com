import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from '@/components/ui/Label'

import { Switch } from './Switch'

const meta = {
  title: 'Components/UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Checked: Story = {
  args: {
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className='flex items-center space-x-2'>
      <Switch id='airplane-mode' />
      <Label htmlFor='airplane-mode'>機内モード</Label>
    </div>
  ),
}

export const FormExample: Story = {
  render: () => (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='space-y-0.5'>
          <Label htmlFor='notifications'>通知を受信</Label>
          <p className='text-sm text-muted-foreground'>新しいメッセージの通知を受信します。</p>
        </div>
        <Switch id='notifications' />
      </div>

      <div className='flex items-center justify-between'>
        <div className='space-y-0.5'>
          <Label htmlFor='marketing-emails'>マーケティングメール</Label>
          <p className='text-sm text-muted-foreground'>
            プロモーションやアップデートを受信します。
          </p>
        </div>
        <Switch id='marketing-emails' />
      </div>

      <div className='flex items-center justify-between'>
        <div className='space-y-0.5'>
          <Label htmlFor='analytics'>アナリティクス</Label>
          <p className='text-sm text-muted-foreground'>使用状況データの収集を許可します。</p>
        </div>
        <Switch id='analytics' defaultChecked />
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <Switch className='h-4 w-7' />
      <Switch />
      <Switch className='h-8 w-14' />
    </div>
  ),
}
