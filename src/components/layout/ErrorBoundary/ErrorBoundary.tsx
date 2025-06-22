import type { ErrorInfo } from 'react'
import { type FallbackProps, ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'

import { Button } from '@/components/ui/Button'

interface ErrorFallbackProps extends FallbackProps {
  title?: string
}

const ErrorFallback = ({
  error,
  resetErrorBoundary,
  title = 'エラーが発生しました',
}: ErrorFallbackProps) => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[400px] p-8 text-center'>
      <div className='max-w-md mx-auto'>
        <div className='mb-6'>
          <div className='w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center'>
            <svg
              className='w-8 h-8 text-destructive'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h2 className='text-xl font-semibold text-foreground mb-2'>{title}</h2>
          <p className='text-sm text-muted-foreground mb-4'>
            予期しないエラーが発生しました。しばらく後にもう一度お試しください。
          </p>
        </div>

        <div className='space-y-3'>
          <Button onClick={resetErrorBoundary} className='w-full'>
            再試行
          </Button>
          <Button variant='outline' onClick={() => (window.location.href = '/')} className='w-full'>
            ホームに戻る
          </Button>
        </div>

        {process.env['NODE_ENV'] === 'development' && (
          <details className='mt-6 text-left'>
            <summary className='cursor-pointer text-sm text-muted-foreground hover:text-foreground'>
              エラー詳細 (開発環境のみ)
            </summary>
            <pre className='mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-32'>
              {error.message}
              {error.stack && '\n\n' + error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<FallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  title?: string
}

const ErrorBoundary = ({ children, fallback, onError, title }: ErrorBoundaryProps) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // エラーログの送信やトラッキング
    console.error('Error Boundary caught an error:', error, errorInfo)

    // カスタムエラーハンドラーがあれば実行
    onError?.(error, errorInfo)
  }

  const FallbackComponent =
    fallback || ((props: FallbackProps) => <ErrorFallback {...props} title={title} />)

  return (
    <ReactErrorBoundary FallbackComponent={FallbackComponent} onError={handleError}>
      {children}
    </ReactErrorBoundary>
  )
}

export { ErrorBoundary, ErrorFallback, type ErrorBoundaryProps }
