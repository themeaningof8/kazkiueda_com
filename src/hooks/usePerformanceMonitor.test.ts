import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  usePerformanceMonitor,
  useLoadPerformance,
  useMemoryMonitor,
} from './usePerformanceMonitor'

// performance APIのモック
const performanceMock = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  memory: {
    usedJSHeapSize: 10000000,
    totalJSHeapSize: 20000000,
  },
}
Object.defineProperty(window, 'performance', {
  value: performanceMock,
  writable: true,
})

// PerformanceObserverのモック
class MockPerformanceObserver {
  callback: PerformanceObserverCallback
  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback
  }
  observe = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
  // テストから手動で呼び出すためのヘルパー
  trigger(entries: PerformanceEntry[]) {
    this.callback(
      {
        getEntries: () => entries,
        getEntriesByName: () => [],
        getEntriesByType: () => [],
      },
      this
    )
  }
}
Object.defineProperty(window, 'PerformanceObserver', {
  value: MockPerformanceObserver,
  writable: true,
})

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'debug').mockImplementation(() => {})
    performanceMock.now.mockClear()
    performanceMock.mark.mockClear()
    performanceMock.measure.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('enabled=false の場合は何もしない', () => {
    renderHook(() => usePerformanceMonitor('TestComponent', false))
    expect(performanceMock.mark).not.toHaveBeenCalled()
  })

  it('enabled=true の場合にパフォーマンスを監視する', () => {
    const { rerender } = renderHook(() => usePerformanceMonitor('TestComponent', true))
    rerender()
    expect(performanceMock.mark).toHaveBeenCalledWith('TestComponent-render-start')
    expect(performanceMock.measure).toHaveBeenCalledWith(
      'TestComponent-render',
      'TestComponent-render-start',
      'TestComponent-render-end'
    )
    expect(console.debug).toHaveBeenCalled()
  })

  it.skip('レンダリング時間が10msを超えた場合に警告を出す', () => {
    performanceMock.now
      .mockReturnValueOnce(0) // renderStartTime
      .mockReturnValueOnce(20) // renderDuration
    const { rerender } = renderHook(() => usePerformanceMonitor('SlowComponent', true))
    rerender()
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Slow render detected: SlowComponent')
    )
  })
})

describe('useLoadPerformance', () => {
  let observerInstance: MockPerformanceObserver | null = null

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    // PerformanceObserverのインスタンスをキャプチャ
    vi.spyOn(window, 'PerformanceObserver').mockImplementation((cb: PerformanceObserverCallback) => {
        const instance = new MockPerformanceObserver(cb)
        observerInstance = instance
        return instance
    });
  })

  afterEach(() => {
    vi.restoreAllMocks()
    observerInstance = null
  })

  it('navigation と resource のパフォーマンスを監視する', () => {
    renderHook(() => useLoadPerformance())
    expect(observerInstance?.observe).toHaveBeenCalledWith({
      entryTypes: ['navigation', 'resource'],
    })

    const navEntry: Partial<PerformanceNavigationTiming> = {
        entryType: 'navigation',
        domContentLoadedEventStart: 100,
        domContentLoadedEventEnd: 200,
        loadEventStart: 250,
        loadEventEnd: 300,
        fetchStart: 50
    }
    const resourceEntry: Partial<PerformanceResourceTiming> = {
        entryType: 'resource',
        name: 'large-bundle.js',
        transferSize: 200000
    }
    
    act(() => {
        observerInstance?.trigger([navEntry as PerformanceNavigationTiming, resourceEntry as PerformanceResourceTiming])
    })

    expect(console.log).toHaveBeenCalledWith('🚀 Page Load Performance:', expect.any(Object))
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Large bundle detected'))
  })

  it('アンマウント時に observer を disconnect する', () => {
    const { unmount } = renderHook(() => useLoadPerformance())
    unmount()
    expect(observerInstance?.disconnect).toHaveBeenCalled()
  })
})


describe('useMemoryMonitor', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'debug').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(global, 'setInterval').mockReturnValue(123 as any)
    vi.spyOn(global, 'clearInterval')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it.skip('enabled=false の場合は何もしない', () => {
    renderHook(() => useMemoryMonitor(false))
    expect(setInterval).not.toHaveBeenCalled()
  })

  it.skip('enabled=true の場合にメモリ使用量を監視する', () => {
    renderHook(() => useMemoryMonitor(true))
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 30000)
    expect(console.debug).toHaveBeenCalledWith('🧠 Memory Usage:', expect.any(Object))
  })

  it.skip('メモリ使用量が50MBを超えた場合に警告を出す', () => {
    Object.defineProperty(performance, 'memory', {
      value: { usedJSHeapSize: 60000000, totalJSHeapSize: 80000000 },
      configurable: true,
    })
    renderHook(() => useMemoryMonitor(true))
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('High memory usage detected'))
  })
  
  it.skip('30秒ごとにメモリをチェックする', () => {
    renderHook(() => useMemoryMonitor(true))
    // The initial call
    expect(console.debug).toHaveBeenCalledTimes(1)

    // Advance timers
    act(() => {
        vi.advanceTimersByTime(30000)
    })
    expect(console.debug).toHaveBeenCalledTimes(2)
    act(() => {
        vi.advanceTimersByTime(30000)
    })
    expect(console.debug).toHaveBeenCalledTimes(3)
  })

  it.skip('アンマウント時に interval を clear する', () => {
      const { unmount } = renderHook(() => useMemoryMonitor(true))
      unmount()
      expect(clearInterval).toHaveBeenCalled()
  })
}) 