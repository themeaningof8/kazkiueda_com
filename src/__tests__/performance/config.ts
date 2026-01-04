/**
 * Performance Tests Configuration
 *
 * パフォーマンステストの設定値と閾値を定義します。
 */

export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals (Googleの推奨値)
  coreWebVitals: {
    // Largest Contentful Paint (2.5秒以内がGood)
    lcp: 2500,
    // First Input Delay (100ms以内がGood)
    fid: 100,
    // Cumulative Layout Shift (0.1以内がGood)
    cls: 0.1,
  },

  // Bundle Size (KB単位)
  bundleSize: {
    // JavaScriptバンドルの最大サイズ
    maxSize: 500,
    // 各チャンクの最大サイズ
    maxChunkSize: 200,
  },

  // Memory Usage (MB単位)
  memory: {
    // メモリリーク判定の閾値
    leakThreshold: 50,
    // ヒープ使用量の最大許容値
    maxHeapUsage: 100,
  },

  // Image Optimization
  images: {
    // 画像の最大ロード時間 (ms)
    maxLoadTime: 2000,
    // 最適化後の最大ファイルサイズ (KB)
    maxOptimizedSize: 500,
  },

  // General Performance
  general: {
    // APIレスポンスの最大時間 (ms)
    maxApiResponseTime: 1000,
    // ページロードの最大時間 (ms)
    maxPageLoadTime: 3000,
  },
} as const;

/**
 * Lighthouse設定
 */
export const LIGHTHOUSE_CONFIG = {
  extends: "lighthouse:default",
  settings: {
    onlyCategories: ["performance"],
    formFactor: "desktop",
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
  },
} as const;

/**
 * テスト実行環境の設定
 */
export const TEST_ENVIRONMENT = {
  // ローカル開発環境
  isLocal: process.env.NODE_ENV === "development",
  // CI環境
  isCI: process.env.CI === "true",
  // ヘッドレスブラウザを使用
  headless: process.env.CI === "true" || process.env.HEADLESS === "true",
  // サーバーURL (CI環境では3001、ローカルでは3000を使用)
  serverUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  // タイムアウト設定 (ms)
  timeout: {
    lighthouse: 60000,
    puppeteer: 30000,
    bundleAnalysis: 10000,
  },
} as const;
