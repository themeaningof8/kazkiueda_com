/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,playwright}.config.*',
      'tests/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,playwright}.config.*',
        'tests/e2e/**',
        'src/main.tsx',
        'src/App.tsx',
        'src/mocks/**',
        'src/test/**',
        'src/types/**',
        '**/*.stories.tsx',
        '**/__snapshots__/**',
        '**/index.ts',
        '**/index.tsx',
        'src/styles/**',
        'src/lib/**',
        'playwright.config.ts',
        'vite.config.ts',
        'vitest.config.ts',
        'postcss.config.js',
        'tailwind.config.js',
        'src/hooks/usePerformanceMonitor.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 60,
        lines: 80,
      },
    },
  },
}) 