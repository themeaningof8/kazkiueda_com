import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * 統合テスト専用設定
 * - 実DBを使用
 * - 直列実行（デッドロック防止）
 */
export default defineConfig({
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/__tests__/setup.ts"],
    globals: true,
    include: ["src/__tests__/integration/**/*.{test,spec}.{ts,tsx}"],
    testTimeout: 60000,
    hookTimeout: 60000,

    // 統合テストは直列実行（DB共有のため）
    fileParallelism: false,

    reporters: ["default", ["junit", { outputFile: "./reports/test-results/junit.xml" }]],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@payload-config": path.resolve(__dirname, "./src/payload.config.ts"),
    },
  },
});
