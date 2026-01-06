/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
const config = {
  // Mutation Testing設定
  packageManager: "npm",
  testRunner: "vitest",
  vitest: {
    // format-date層専用のVitest設定を使用
    configFile: "vitest.config.format-date.ts",
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
    fileName: "reports/mutation/format-date/index.html",
  },
  jsonReporter: {
    fileName: "reports/mutation/format-date/mutation-report.json",
  },

  // データ変換層のみをテスト
  mutate: ["src/lib/format-date.ts"],

  // 除外パターン（最小限）
  ignorePatterns: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/coverage/**",
    "**/reports/**",
  ],

  // しきい値設定（85%以上を目標）
  thresholds: {
    high: 85,
    low: 70,
    break: 60,
  },

  // 並列実行設定
  concurrency: 2,

  // ログレベル
  logLevel: "info",

  // テンポラリディレクトリ
  tempDirName: ".stryker-tmp",

  // クリーンアップ
  cleanTempDir: true,
};

export default config;
