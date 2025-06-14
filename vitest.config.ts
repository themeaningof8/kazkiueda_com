/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    alias: {
      gsap: '/src/test/__mocks__/gsap.ts',
      '@gsap/react': '/src/test/__mocks__/@gsap/react.ts',
    },
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],

    // パフォーマンス最適化設定
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // 小規模プロジェクト向け高速化
      },
    },

    // 自動Mock管理（手動cleanup不要）
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,

    coverage: {
      provider: 'v8', // c8より高速
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts', 'dist/', '.astro/'],
      thresholds: {
        global: { branches: 80, functions: 80, lines: 80, statements: 80 },
      },
    },

    // タイムアウト設定（デバッグ時の中断防止）
    testTimeout: 10000,
    hookTimeout: 10000,

    // ファイル変更検知最適化は外部設定で対応

    // テスト分離モード（メモリリーク防止）
    isolate: true,
  },
});
