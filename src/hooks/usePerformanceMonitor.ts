import { useEffect, useRef } from 'react'

// 開発環境かどうかを判定
const isDev = process.env['NODE_ENV'] === 'development'

/**
 * コンポーネントのレンダリングパフォーマンスを監視するカスタムフック
 * @param componentName 監視するコンポーネントの名前
 * @param enabled 監視を有効にするかどうか（開発環境でのみ有効にすることを推奨）
 */
export const usePerformanceMonitor = (componentName: string, enabled = isDev) => {
  const renderStartTime = useRef<number>(0)
  const renderCount = useRef(0)

  useEffect(() => {
    if (!enabled) return

    // レンダリング開始時間を記録
    renderStartTime.current = performance.now()
    renderCount.current += 1
  }, [enabled])

  useEffect(() => {
    if (!enabled || !renderStartTime.current) return

    // レンダリング完了時間を計算
    const renderDuration = performance.now() - renderStartTime.current

    // レンダリング時間を記録
    performance.mark(`${componentName}-render-end`)
    performance.measure(
      `${componentName}-render`,
      `${componentName}-render-start`,
      `${componentName}-render-end`
    )

    // 開発環境でのログ出力
    if (renderDuration > 10) {
      // 10ms以上のレンダリングを警告
      console.warn(`🐌 Slow render detected: ${componentName} took ${renderDuration.toFixed(2)}ms`)
    }

    console.debug(
      `📊 ${componentName} rendered in ${renderDuration.toFixed(2)}ms (render #${renderCount.current})`
    )
  }, [componentName, enabled])

  // マーク作成用のエフェクト
  useEffect(() => {
    if (!enabled) return
    performance.mark(`${componentName}-render-start`)
  }, [componentName, enabled])

  return {
    renderCount: renderCount.current,
  }
}

/**
 * バンドルサイズとロードパフォーマンスを監視するフック
 */
export const useLoadPerformance = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries()

      entries.forEach(entry => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          console.log('🚀 Page Load Performance:', {
            'DOM Content Loaded': `${navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart}ms`,
            'Load Complete': `${navEntry.loadEventEnd - navEntry.loadEventStart}ms`,
            'First Paint': `${navEntry.domContentLoadedEventEnd - navEntry.fetchStart}ms`,
          })
        }

        if (entry.entryType === 'resource' && entry.name.includes('.js')) {
          const resourceEntry = entry as PerformanceResourceTiming
          if (resourceEntry.transferSize > 100000) {
            // 100KB以上のリソースを警告
            console.warn(
              `📦 Large bundle detected: ${entry.name} (${(resourceEntry.transferSize / 1024).toFixed(2)}KB)`
            )
          }
        }
      })
    })

    observer.observe({ entryTypes: ['navigation', 'resource'] })

    return () => observer.disconnect()
  }, [])
}

/**
 * メモリ使用量を監視するフック
 */
export const useMemoryMonitor = (enabled = isDev) => {
  useEffect(() => {
    if (!enabled || !('memory' in performance)) return

    const checkMemory = () => {
      const memory = (performance as any).memory
      if (memory) {
        const usedMemory = memory.usedJSHeapSize / 1024 / 1024 // MB
        const totalMemory = memory.totalJSHeapSize / 1024 / 1024 // MB

        console.debug('🧠 Memory Usage:', {
          used: `${usedMemory.toFixed(2)}MB`,
          total: `${totalMemory.toFixed(2)}MB`,
          percentage: `${((usedMemory / totalMemory) * 100).toFixed(1)}%`,
        })

        if (usedMemory > 50) {
          // 50MB以上の使用量を警告
          console.warn(`🚨 High memory usage detected: ${usedMemory.toFixed(2)}MB`)
        }
      }
    }

    const interval = setInterval(checkMemory, 30000) // 30秒ごとにチェック
    checkMemory() // 初回実行

    return () => clearInterval(interval)
  }, [enabled])
}
