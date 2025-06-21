import type { Meta, StoryObj } from '@storybook/react'

import { BrowserRouter } from 'react-router-dom'

import Layout from './Layout'

const meta = {
  title: 'Components/Layout/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Layout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div className='text-center py-8'>
        <h1 className='text-2xl font-bold'>サンプルコンテンツ</h1>
        <p className='mt-4 text-muted-foreground'>これはLayoutコンポーネントのサンプル表示です。</p>
      </div>
    ),
  },
}

export const WithLongContent: Story = {
  args: {
    children: (
      <div className='space-y-4'>
        <h1 className='text-3xl font-bold'>長いコンテンツの例</h1>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className='p-4 border rounded'>
            <h2 className='text-xl font-semibold'>セクション {i + 1}</h2>
            <p className='mt-2 text-muted-foreground'>
              これは長いコンテンツの例です。Layoutコンポーネントが
              どのように長いコンテンツを処理するかを確認できます。
              スクロールの動作やナビゲーションの位置なども 確認することができます。
            </p>
          </div>
        ))}
      </div>
    ),
  },
}
