import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * ユニットテスト専用設定
 * - モックを使用するためDB不要
 * - 並列実行可能 → 高速
 */
export default defineConfig({
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/__tests__/setup.ts"],
    globals: true,
    include: ["src/__tests__/unit/**/*.{test,spec}.{ts,tsx}"],
    testTimeout: 30000,
    hookTimeout: 30000,

    // ユニットテストは並列実行可能！
    fileParallelism: true,

    reporters: ["default"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@payload-config": path.resolve(__dirname, "./src/payload.config.ts"),
    },
  },
});
