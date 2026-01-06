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
      ],
      thresholds: {
        // Week 3目標: Collections層テスト実装完了
        lines: 75,      // 62.39% → 75% (Collections層強化)
        functions: 80,  // 64.17% → 80% (Collections層強化)
        branches: 62,   // 46.03% → 62% (Collections層強化)
        statements: 75, // 59.7% → 75% (Collections層強化)
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
