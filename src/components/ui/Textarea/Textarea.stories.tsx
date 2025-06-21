import type { Meta, StoryObj } from '@storybook/react'

import * as React from 'react'

import { Label } from '@/components/ui/Label/Label'

import { Textarea } from './Textarea'

const meta = {
  title: 'Components/UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: { type: 'boolean' },
    },
    rows: {
      control: { type: 'number' },
    },
  },
  args: {
    placeholder: 'テキストを入力してください...',
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: '無効な入力フィールド',
  },
}

export const WithRows: Story = {
  args: {
    rows: 8,
    placeholder: '8行のテキストエリア',
  },
}

export const Resizable: Story = {
  args: {
    className: 'resize',
    placeholder: 'リサイズ可能なテキストエリア',
  },
}

export const NonResizable: Story = {
  args: {
    className: 'resize-none',
    placeholder: 'リサイズ不可のテキストエリア',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className='w-80 space-y-2'>
      <Label htmlFor='message'>メッセージ</Label>
      <Textarea id='message' placeholder='ここにメッセージを入力してください...' />
    </div>
  ),
}

export const FormExample: Story = {
  render: () => (
    <div className='w-96 space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='feedback'>
          フィードバック<span className='text-destructive ml-1'>*</span>
        </Label>
        <Textarea
          id='feedback'
          placeholder='サービスについてのフィードバックをお聞かせください...'
          rows={4}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='comments'>追加コメント</Label>
        <Textarea id='comments' placeholder='任意のコメントがあればご記入ください' rows={3} />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='description'>説明</Label>
        <Textarea
          id='description'
          placeholder='詳細な説明を入力してください...'
          className='min-h-32'
        />
      </div>
    </div>
  ),
}

export const CharacterCount: Story = {
  render: () => {
    const [value, setValue] = React.useState('')
    const maxLength = 280

    return (
      <div className='w-80 space-y-2'>
        <Label htmlFor='tweet'>ツイート</Label>
        <Textarea
          id='tweet'
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder='いまどうしてる？'
          maxLength={maxLength}
          rows={3}
        />
        <div className='text-right text-sm text-muted-foreground'>
          {value.length}/{maxLength}
        </div>
      </div>
    )
  },
}
