/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
const config = {
  // Mutation Testing設定
  packageManager: "npm",
  testRunner: "vitest",
  vitest: {
    configFile: "vitest.config.ts",
  },

  // TypeScriptチェッカー設定
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",

  // カバレッジ設定
  coverageAnalysis: "perTest",

  // タイムアウト設定（ミリ秒）
  timeoutMS: 60000,
  timeoutFactor: 2,

  // レポーター設定
  reporters: ["html", "clear-text", "progress", "json"],
  htmlReporter: {
    baseDir: "reports/mutation",
  },
  jsonReporter: {
    fileName: "reports/mutation/mutation-report.json",
  },

  // ミューテーション対象ファイル（段階的に実施）
  mutate: [
    // Phase 1: ビジネスロジック層
    "src/lib/posts.ts",

    // Phase 2: データ変換層
    "src/lib/format-date.ts",

    // Phase 3: エラー層
    "src/lib/errors.ts",
  ],

  // 除外パターン
  ignorePatterns: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/coverage/**",
    "**/reports/**",
    "**/__tests__/**",
    "**/*.test.ts",
    "**/*.spec.ts",
  ],

  // ミューテーション設定
  mutator: {
    plugins: ["typescript"],
    // 除外するミューテーター
    excludedMutations: [
      // ログ出力の変更は除外
      "StringLiteral",
      // コメントの変更は除外
      "BlockStatement",
    ],
  },

  // しきい値設定（80%以上を目標）
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },

  // 並列実行設定
  concurrency: 4,
  maxConcurrentTestRunners: 4,

  // ログレベル
  logLevel: "info",

  // テンポラリディレクトリ
  tempDirName: ".stryker-tmp",

  // クリーンアップ
  cleanTempDir: true,
};

export default config;
