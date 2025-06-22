import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bell, MoreHorizontal, Settings } from 'lucide-react'

import { Button } from '@/components/ui/Button'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './Card'

const meta = {
  title: 'Components/UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className='w-96'>
      <CardHeader>
        <CardTitle>カードタイトル</CardTitle>
        <CardDescription>
          これはカードの説明文です。詳細な情報をここに記載することができます。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          カードのメインコンテンツをここに配置します。テキスト、画像、その他の要素を含めることができます。
        </p>
      </CardContent>
      <CardFooter>
        <Button>アクション</Button>
      </CardFooter>
    </Card>
  ),
}

export const WithAction: Story = {
  render: () => (
    <Card className='w-96'>
      <CardHeader>
        <CardTitle>設定</CardTitle>
        <CardDescription>アカウント設定を管理します。</CardDescription>
        <CardAction>
          <Button variant='ghost' size='icon'>
            <MoreHorizontal />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Bell className='size-4' />
            <span>通知を有効にする</span>
          </div>
          <div className='flex items-center gap-2'>
            <Settings className='size-4' />
            <span>詳細設定</span>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
}

export const Simple: Story = {
  render: () => (
    <Card className='w-80'>
      <CardHeader>
        <CardTitle>シンプルなカード</CardTitle>
      </CardHeader>
      <CardContent>
        <p>最小限の構成でカードを表示します。</p>
      </CardContent>
    </Card>
  ),
}

export const WithBorder: Story = {
  render: () => (
    <Card className='w-96'>
      <CardHeader className='border-b'>
        <CardTitle>境界線付きヘッダー</CardTitle>
        <CardDescription>ヘッダーに境界線を追加した例です。</CardDescription>
      </CardHeader>
      <CardContent>
        <p>境界線によってセクションが明確に分かれています。</p>
      </CardContent>
      <CardFooter className='border-t'>
        <Button variant='outline'>キャンセル</Button>
        <Button>保存</Button>
      </CardFooter>
    </Card>
  ),
}
