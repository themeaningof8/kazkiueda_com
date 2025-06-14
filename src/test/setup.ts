import { vi, beforeAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup(); // DOM自動クリーンアップ

  // メモリリーク防止
  vi.clearAllTimers();
  vi.unstubAllGlobals();
});

beforeAll(() => {
  // localStorage/sessionStorage自動Mock
  const createStorageMock = () => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  };

  Object.defineProperty(window, 'localStorage', { value: createStorageMock() });
  Object.defineProperty(window, 'sessionStorage', {
    value: createStorageMock(),
  });

  // matchMedia自動Mock（CSS Media Queries対応）
  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });

  // IntersectionObserver自動Mock（無限スクロール・遅延読み込み対応）
  if (!window.IntersectionObserver) {
    Object.defineProperty(window, 'IntersectionObserver', {
      value: class MockIntersectionObserver {
        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
      },
    });
  }

  // ResizeObserver自動Mock（レスポンシブ対応）
  if (!window.ResizeObserver) {
    Object.defineProperty(window, 'ResizeObserver', {
      value: class MockResizeObserver {
        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
      },
    });
  }

  // GSAP Mock は各テストファイルで vi.mock() を使用 (deepwiki推奨戦略)
});
