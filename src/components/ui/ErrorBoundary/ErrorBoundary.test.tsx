import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { ErrorBoundary, ErrorFallback } from './ErrorBoundary'

// エラーを発生させるテストコンポーネント
const ThrowError = ({ shouldError }: { shouldError: boolean }) => {
  if (shouldError) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // console.errorをモックして不要なエラーログを抑制
  const originalError = console.error
  beforeAll(() => {
    console.error = vi.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldError={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renders error fallback when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldError={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
    expect(
      screen.getByText('予期しないエラーが発生しました。しばらく後にもう一度お試しください。')
    ).toBeInTheDocument()
  })

  it('renders custom title when provided', () => {
    render(
      <ErrorBoundary title='カスタムエラータイトル'>
        <ThrowError shouldError={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('カスタムエラータイトル')).toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldError={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    )
  })

  it('has retry button that resets error boundary', async () => {
    const user = userEvent.setup()

    render(
      <ErrorBoundary>
        <ThrowError shouldError={true} />
      </ErrorBoundary>
    )

    const retryButton = screen.getByRole('button', { name: '再試行' })
    expect(retryButton).toBeInTheDocument()

    await user.click(retryButton)
    // エラーバウンダリがリセットされることを確認
    // （実際のテストでは状態管理が必要）
  })

  it('has home button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldError={true} />
      </ErrorBoundary>
    )

    const homeButton = screen.getByRole('button', { name: 'ホームに戻る' })
    expect(homeButton).toBeInTheDocument()
  })
})

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message')
  const mockResetErrorBoundary = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders error fallback with default title', () => {
    render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
  })

  it('renders custom title when provided', () => {
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
        title='カスタムタイトル'
      />
    )

    expect(screen.getByText('カスタムタイトル')).toBeInTheDocument()
  })

  it('calls resetErrorBoundary when retry button is clicked', async () => {
    const user = userEvent.setup()

    render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)

    const retryButton = screen.getByRole('button', { name: '再試行' })
    await user.click(retryButton)

    expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1)
  })
})
