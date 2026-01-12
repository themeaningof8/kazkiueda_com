import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/__tests__/setup.ts"],
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    testTimeout: 60000, // 30秒 → 60秒（全体的な安定性のため）
    hookTimeout: 60000,

    // Deadlock対策: インテグレーションテストが共有DBを使うため、完全に直列実行する
    fileParallelism: false,
    reporters: ['default', ['junit', { outputFile: './reports/test-results/junit.xml' }]],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "reports/coverage",
      exclude: [
        // UIコンポーネントはアクセシビリティテストとして別管理
        "src/components/ui/**",
        // テストファイル自体
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/*.config.{ts,js}",
        // Payloadコレクション設定ファイル（設定ファイルなのでテスト不要）
        "src/collections/**",
      ],
      thresholds: {
        // Phase 2目標: エッジケース・境界値テスト追加後
        lines: 80,      // 75% → 80% (エッジケース追加)
        functions: 85,  // 80% → 85% (境界値テスト追加)
        branches: 70,   // 62% → 70% (エラーハンドリング強化)
        statements: 80, // 75% → 80% (全体的な網羅性向上)
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@payload-config": path.resolve(__dirname, "./src/payload.config.ts"),
    },
  },
});
