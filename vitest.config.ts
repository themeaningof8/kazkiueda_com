import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/__tests__/setup.ts"],
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    testTimeout: 30000, // 5秒 → 30秒（Deadlock対策）
    hookTimeout: 30000, // hookも30秒

    // Vitest 4での並列制御設定（現在はpackage.jsonの順次実行スクリプトでDeadlockを回避しているため未使用）
    // pool: "forks",
    // poolOptions: {
    //   forks: {
    //     singleFork: true, // 1プロセスで実行（Deadlock回避）
    //   },
    // },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "reports/coverage",
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
