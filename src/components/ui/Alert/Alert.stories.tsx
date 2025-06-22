import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from './Alert'

const meta = {
  title: 'Components/UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive'],
    },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Alert className='max-w-md'>
      <Info />
      <AlertTitle>情報</AlertTitle>
      <AlertDescription>これは一般的な情報を表示するためのアラートです。</AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Alert variant='destructive' className='max-w-md'>
      <AlertCircle />
      <AlertTitle>エラー</AlertTitle>
      <AlertDescription>何かが間違っています。この操作を完了できませんでした。</AlertDescription>
    </Alert>
  ),
}

export const Success: Story = {
  render: () => (
    <Alert className='max-w-md'>
      <CheckCircle2 className='text-green-600' />
      <AlertTitle>成功</AlertTitle>
      <AlertDescription>操作が正常に完了しました。</AlertDescription>
    </Alert>
  ),
}

export const Warning: Story = {
  render: () => (
    <Alert className='max-w-md'>
      <AlertTriangle className='text-yellow-600' />
      <AlertTitle>警告</AlertTitle>
      <AlertDescription>
        この操作は元に戻すことができません。続行してもよろしいですか？
      </AlertDescription>
    </Alert>
  ),
}

export const WithoutIcon: Story = {
  render: () => (
    <Alert className='max-w-md'>
      <AlertTitle>アイコンなし</AlertTitle>
      <AlertDescription>アイコンを使用しないアラートメッセージです。</AlertDescription>
    </Alert>
  ),
}

export const TitleOnly: Story = {
  render: () => (
    <Alert className='max-w-md'>
      <Info />
      <AlertTitle>タイトルのみのアラート</AlertTitle>
    </Alert>
  ),
}
