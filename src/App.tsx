import { Suspense, lazy } from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import Layout from '@/components/layout'
import { useLoadPerformance, useMemoryMonitor } from '@/hooks/usePerformanceMonitor'

// ページコンポーネントの遅延読み込み
const HomePage = lazy(() => import('@/pages/HomePage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))

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
    <Router>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/about' element={<AboutPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  )
}

export default App
