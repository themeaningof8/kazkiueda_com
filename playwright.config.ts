import { defineConfig, devices } from '@playwright/test';
// NOTE: ここは設定ファイルです。ターミナルコマンドを貼らないでください。
// 環境変数は dotenvx から注入されるため、dotenv による直接読み込みは行わない

const isCI = !!process.env.GITHUB_ACTIONS;

export default defineConfig({
  // グローバルセットアップ・ティアダウンは各テストで個別に実行
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  // 常に詳細なログを出力して進捗を確認
  reporter: [
    ['line', { printSteps: true }],
    ['html', { open: 'never' }],
  ],

  // テストのタイムアウト設定
  timeout: 60 * 1000, // 30秒 → 60秒（CI環境での安定性のため）
  expect: {
    timeout: 10 * 1000, // 5秒 → 10秒
  },

  use: {
    // 環境変数からbaseURLを取得（本番環境用）、なければデフォルト値を使用
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ja-JP', // 日付フォーマットのテスト用
    timezoneId: 'Asia/Tokyo', // タイムゾーン
  },

  projects: [
    // セットアッププロジェクト (認証状態の生成)
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // 1. 認証不要なテスト
    {
      name: 'unauthenticated',
      testMatch: [
        '**/error-handling.spec.ts',
        '**/accessibility.spec.ts',
        '**/accessibility-essential.spec.ts', // Added
      ],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
      },
    },

    // 2. 認証必要なテスト（自動ログイン）
    {
      name: 'authenticated',
      dependencies: ['setup'], // setupプロジェクトに依存
      testIgnore: [
        '**/error-handling.spec.ts',
        '**/accessibility.spec.ts',
        '**/accessibility-essential.spec.ts', // Ignored
        '**/auth.setup.ts', // Setupファイルを除外
      ],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001',
        storageState: 'tests/e2e/.auth/admin.json',
      },
    },
  ],

  // webServerは手動で起動するため、自動起動しない
  // webServer: { ... }

});