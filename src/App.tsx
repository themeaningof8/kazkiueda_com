import { Suspense, lazy } from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import Layout from '@/components/layout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { useLoadPerformance, useMemoryMonitor } from '@/hooks/usePerformanceMonitor'

// ページコンポーネントの遅延読み込み
const HomePage = lazy(() => import('@/features/home'))
const AboutPage = lazy(() => import('@/features/about'))

// Loading コンポーネント
const PageLoader = () => (
  <div className='flex items-center justify-center min-h-[60vh]'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
  </div>
)

function App() {
  // パフォーマンス監視を有効化
  useLoadPerformance()
  useMemoryMonitor()

  return (
    <ErrorBoundary
      title='アプリケーションエラー'
      onError={(error, errorInfo) => {
        // エラー追跡サービスへの送信
        console.error('Application Error:', error)
        console.error('Error Info:', errorInfo)
        // 実際のアプリケーションでは、Sentry等のエラー追跡サービスに送信
      }}
    >
      <Router>
        <Layout>
          <ErrorBoundary title='ページ読み込みエラー'>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/about' element={<AboutPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Layout>
      </Router>
    </ErrorBoundary>
  )
}

export default App
