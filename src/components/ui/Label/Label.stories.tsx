import type { Meta, StoryObj } from '@storybook/react-vite'
import { Info } from 'lucide-react'

import { Checkbox } from '@/components/ui/Checkbox/Checkbox'
import { Input } from '@/components/ui/Input/Input'

import { Label } from './Label'

const meta = {
  title: 'Components/UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    children: 'ラベル',
  },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithInput: Story = {
  render: () => (
    <div className='space-y-2'>
      <Label htmlFor='email'>メールアドレス</Label>
      <Input id='email' type='email' placeholder='example@email.com' />
    </div>
  ),
}

export const WithCheckbox: Story = {
  render: () => (
    <div className='flex items-center space-x-2'>
      <Checkbox id='terms' />
      <Label htmlFor='terms'>利用規約に同意する</Label>
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Label className='space-x-2'>
      <Info className='size-4' />
      <span>情報アイコン付きラベル</span>
    </Label>
  ),
}

export const Required: Story = {
  render: () => (
    <div className='space-y-2'>
      <Label htmlFor='name'>
        名前<span className='text-destructive ml-1'>*</span>
      </Label>
      <Input id='name' placeholder='必須項目' required />
    </div>
  ),
}

export const FormExample: Story = {
  render: () => (
    <div className='w-80 space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='username'>ユーザー名</Label>
        <Input id='username' placeholder='ユーザー名を入力' />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='password'>
          パスワード<span className='text-destructive ml-1'>*</span>
        </Label>
        <Input id='password' type='password' placeholder='パスワードを入力' />
      </div>

      <div className='flex items-center space-x-2'>
        <Checkbox id='remember' />
        <Label htmlFor='remember'>ログイン状態を保持する</Label>
      </div>

      <div className='flex items-center space-x-2'>
        <Checkbox id='newsletter' />
        <Label htmlFor='newsletter' className='text-sm text-muted-foreground'>
          ニュースレターを受信する（オプション）
        </Label>
      </div>
    </div>
  ),
}
