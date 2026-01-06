/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
const config = {
  // Mutation Testing設定
  packageManager: "npm",
  testRunner: "vitest",
  vitest: {
    // エラー層専用のVitest設定を使用
    configFile: "vitest.config.errors.ts",
  },

  // TypeScriptチェッカー設定
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",

  // カバレッジ設定
  coverageAnalysis: "all",

  // タイムアウト設定（ミリ秒）
  timeoutMS: 30000,
  timeoutFactor: 2,

  // レポーター設定
  reporters: ["html", "clear-text", "progress", "json"],
  htmlReporter: {
    baseDir: "reports/mutation/errors",
  },
  jsonReporter: {
    fileName: "reports/mutation/errors/mutation-report.json",
  },

  // エラー層のみをテスト
  mutate: ["src/lib/errors.ts"],

  // 除外パターン（最小限）
  ignorePatterns: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/coverage/**",
    "**/reports/**",
  ],

  // しきい値設定（80%以上を目標）
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },

  // 並列実行設定
  concurrency: 2,
  maxConcurrentTestRunners: 2,

  // ログレベル
  logLevel: "info",

  // テンポラリディレクトリ
  tempDirName: ".stryker-tmp",

  // クリーンアップ
  cleanTempDir: true,
};

export default config;
