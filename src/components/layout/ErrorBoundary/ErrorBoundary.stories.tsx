import type { Meta, StoryObj } from '@storybook/react'

import { useState } from 'react'

import { Button } from '@/components/ui/Button'

import { ErrorBoundary, ErrorFallback } from './ErrorBoundary'

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/Layout/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'React Error Boundaryを使用したエラーハンドリングコンポーネント',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ErrorBoundary>

// エラーを発生させるテストコンポーネント
const ErrorComponent = ({ shouldError }: { shouldError: boolean }) => {
  if (shouldError) {
    throw new Error('これはテスト用のエラーです')
  }
  return <div className='p-4 text-center'>正常に表示されています</div>
}

// エラーを発生させるためのデモコンポーネント
const ErrorDemo = () => {
  const [hasError, setHasError] = useState(false)

  return (
    <div className='space-y-4'>
      <div className='text-center'>
        <Button
          onClick={() => setHasError(!hasError)}
          variant={hasError ? 'default' : 'destructive'}
        >
          {hasError ? 'エラーを解除' : 'エラーを発生させる'}
        </Button>
      </div>
      <ErrorBoundary key={hasError ? 'error' : 'normal'}>
        <ErrorComponent shouldError={hasError} />
      </ErrorBoundary>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <ErrorBoundary>
      <div className='p-4 bg-muted rounded-lg text-center'>
        <p>エラーが発生していない状態です。</p>
        <p>子コンポーネントが正常に表示されています。</p>
      </div>
    </ErrorBoundary>
  ),
}

export const WithError: Story = {
  render: () => (
    <ErrorBoundary>
      <ErrorComponent shouldError={true} />
    </ErrorBoundary>
  ),
}

export const WithCustomTitle: Story = {
  render: () => (
    <ErrorBoundary title='カスタムエラータイトル'>
      <ErrorComponent shouldError={true} />
    </ErrorBoundary>
  ),
}

export const WithCustomOnError: Story = {
  render: () => (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.log('Custom error handler:', error.message)
        console.log('Error info:', errorInfo)
      }}
    >
      <ErrorComponent shouldError={true} />
    </ErrorBoundary>
  ),
}

export const Interactive: Story = {
  render: () => <ErrorDemo />,
  parameters: {
    docs: {
      description: {
        story: 'ボタンをクリックしてエラーの発生とリセットをテストできます。',
      },
    },
  },
}

export const ErrorFallbackOnly: Story = {
  render: () => (
    <ErrorFallback
      error={new Error('サンプルエラーメッセージ')}
      resetErrorBoundary={() => console.log('Reset error boundary')}
      title='エラーフォールバックのみ'
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'ErrorFallbackコンポーネント単体の表示です。',
      },
    },
  },
}
