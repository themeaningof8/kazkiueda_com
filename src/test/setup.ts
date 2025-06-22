import '@testing-library/jest-dom'
import { vi } from 'vitest' // グローバルオブジェクトの設定

;(globalThis as any).vi = vi

// ResizeObserver mock for Radix ui components
global.ResizeObserver = class ResizeObserver {
  callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe() {
    // Mock implementation
  }

  unobserve() {
    // Mock implementation
  }

  disconnect() {
    // Mock implementation
  }
}

// IntersectionObserver mock with proper implementation
const mockIntersectionObserver = vi.fn(() => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: () => [],
}))

global.IntersectionObserver = mockIntersectionObserver

// scrollIntoView mock for Element
if (typeof Element !== 'undefined' && Element.prototype) {
  Element.prototype.scrollIntoView = vi.fn()
}

// matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// getComputedStyle mock
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
})

// elementFromPoint mock for InputOTP
Object.defineProperty(document, 'elementFromPoint', {
  writable: true,
  value: vi.fn().mockReturnValue(null),
})

// ポータル要素のモック
const portalRoot = document.createElement('div')
portalRoot.setAttribute('id', 'portal-root')
document.body.appendChild(portalRoot)
