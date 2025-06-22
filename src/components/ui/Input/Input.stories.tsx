import type { Meta, StoryObj } from '@storybook/react-vite'
import { Search } from 'lucide-react'

import { Input } from './Input'

const meta = {
  title: 'Components/UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
  args: {
    placeholder: '入力してください...',
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'メールアドレスを入力',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'パスワードを入力',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: '無効な入力フィールド',
  },
}

export const WithIcon: Story = {
  render: () => (
    <div className='relative'>
      <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
      <Input placeholder='検索...' className='pl-10' />
    </div>
  ),
}

export const FormExample: Story = {
  render: () => (
    <div className='w-80 space-y-4'>
      <div className='space-y-2'>
        <label htmlFor='name' className='text-sm font-medium'>
          名前
        </label>
        <Input id='name' placeholder='田中太郎' />
      </div>
      <div className='space-y-2'>
        <label htmlFor='email' className='text-sm font-medium'>
          メールアドレス
        </label>
        <Input id='email' type='email' placeholder='example@email.com' />
      </div>
      <div className='space-y-2'>
        <label htmlFor='phone' className='text-sm font-medium'>
          電話番号
        </label>
        <Input id='phone' type='tel' placeholder='090-1234-5678' />
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className='w-80 space-y-3'>
      <Input placeholder='標準サイズ' className='h-9' />
      <Input placeholder='小さなサイズ' className='h-8 text-xs' />
      <Input placeholder='大きなサイズ' className='h-11' />
    </div>
  ),
}
