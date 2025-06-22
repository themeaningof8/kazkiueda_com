import { memo } from 'react'

import Navigation from '@/components/layout/Navigation'
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = memo(({ children }: LayoutProps) => {
  usePerformanceMonitor('Layout')

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />
      <main className='container mx-auto px-4 py-8'>{children}</main>
    </div>
  )
})

Layout.displayName = 'Layout'

export default Layout
