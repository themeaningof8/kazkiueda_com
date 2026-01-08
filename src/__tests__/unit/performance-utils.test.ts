import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  assertPerformanceThreshold,
  getMemoryUsage,
  shouldSkipPerformanceTest,
} from "@/lib/performance/utils";

describe("performance/utils", () => {
  const memoryUsageMock = vi.fn();

  beforeEach(() => {
    // process.memoryUsageをモック
    memoryUsageMock.mockReturnValue({
      heapUsed: 50 * 1024 * 1024, // 50MB
      heapTotal: 100 * 1024 * 1024, // 100MB
      external: 10 * 1024 * 1024, // 10MB
      rss: 150 * 1024 * 1024, // 150MB
    });
    vi.stubGlobal("process", {
      ...process,
      memoryUsage: memoryUsageMock,
    });
  });

  afterEach(() => {
    // モックを元に戻す
    vi.restoreAllMocks();
  });

  describe("assertPerformanceThreshold", () => {
    test("閾値以内の値は正常終了", () => {
      expect(() => {
        assertPerformanceThreshold("coreWebVitals", "lcp", 2000);
      }).not.toThrow();
    });

    test("閾値を超える値はエラーを投げる", () => {
      expect(() => {
        assertPerformanceThreshold("coreWebVitals", "lcp", 3000);
      }).toThrow("Performance threshold exceeded: coreWebVitals.lcp = 3000 (threshold: 2500)");
    });

    test("単位付きでエラーメッセージを表示", () => {
      expect(() => {
        assertPerformanceThreshold("bundleSize", "maxSize", 600, "KB");
      }).toThrow("Performance threshold exceeded: bundleSize.maxSize = 600KB (threshold: 500KB)");
    });

    test("無効なメトリック名の場合エラー", () => {
      expect(() => {
        assertPerformanceThreshold("coreWebVitals", "invalidMetric" as any, 100);
      }).toThrow("Invalid threshold configuration for coreWebVitals.invalidMetric");
    });

    test("境界値のテスト - ちょうど閾値は正常", () => {
      expect(() => {
        assertPerformanceThreshold("coreWebVitals", "fid", 100);
      }).not.toThrow();
    });

    test("境界値のテスト - 閾値を超える", () => {
      expect(() => {
        assertPerformanceThreshold("coreWebVitals", "fid", 101);
      }).toThrow("Performance threshold exceeded: coreWebVitals.fid = 101 (threshold: 100)");
    });
  });

  describe("getMemoryUsage", () => {
    test("メモリ使用量をMB単位で正しく計算", () => {
      const result = getMemoryUsage();
      // 50MBのheapUsedをMB単位で返す（小数点2桁）
      expect(result).toBe(50);
    });

    test("メモリ使用量の計算が正しい", () => {
      // 75MBのheapUsedを設定
      (process.memoryUsage as any).mockReturnValue({
        heapUsed: 75 * 1024 * 1024, // 75MB
        heapTotal: 100 * 1024 * 1024,
        external: 10 * 1024 * 1024,
        rss: 150 * 1024 * 1024,
      });

      const result = getMemoryUsage();
      expect(result).toBe(75);
    });

    test("小数点以下の値が正しく丸められる", () => {
      // 12.345MBのheapUsedを設定
      (process.memoryUsage as any).mockReturnValue({
        heapUsed: 12.345 * 1024 * 1024,
        heapTotal: 100 * 1024 * 1024,
        external: 10 * 1024 * 1024,
        rss: 150 * 1024 * 1024,
      });

      const result = getMemoryUsage();
      expect(result).toBe(12.35); // 小数点2桁で丸め
    });
  });

  describe("shouldSkipPerformanceTest", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
      (process.env as any) = { ...originalEnv };
    });

    afterEach(() => {
      (process.env as any) = { ...originalEnv };
    });

    test("CI環境ではスキップしない", async () => {
      process.env.CI = "true";
      process.env.NODE_ENV = "development";

      // モジュールを再importして環境変数の変更を反映
      const { shouldSkipPerformanceTest: freshShouldSkip } = await import(
        "@/lib/performance/utils"
      );

      expect(freshShouldSkip("ci-only")).toBe(false);
      expect(freshShouldSkip("heavy")).toBe(false);
    });

    test("CI環境以外ではci-onlyテストをスキップ", async () => {
      process.env.CI = undefined;
      process.env.NODE_ENV = "development";

      const { shouldSkipPerformanceTest: freshShouldSkip } = await import(
        "@/lib/performance/utils"
      );

      expect(freshShouldSkip("ci-only")).toBe(true);
    });

    test("ローカル環境ではheavyテストをスキップ", async () => {
      process.env.CI = undefined;
      process.env.NODE_ENV = "development";

      const { shouldSkipPerformanceTest: freshShouldSkip } = await import(
        "@/lib/performance/utils"
      );

      expect(freshShouldSkip("heavy")).toBe(true);
    });

    test("CI環境ではheavyテストも実行", async () => {
      process.env.CI = "true";
      process.env.NODE_ENV = "development";

      const { shouldSkipPerformanceTest: freshShouldSkip } = await import(
        "@/lib/performance/utils"
      );

      expect(freshShouldSkip("heavy")).toBe(false);
    });

    test("reasonが指定されていない場合はスキップしない", async () => {
      process.env.CI = undefined;
      process.env.NODE_ENV = "development";

      const { shouldSkipPerformanceTest: freshShouldSkip } = await import(
        "@/lib/performance/utils"
      );

      expect(freshShouldSkip()).toBe(false);
    });

    test("本番環境ではスキップ条件に関わらず実行", async () => {
      process.env.CI = "true";
      process.env.NODE_ENV = "production";

      const { shouldSkipPerformanceTest: freshShouldSkip } = await import(
        "@/lib/performance/utils"
      );

      expect(freshShouldSkip("ci-only")).toBe(false);
      expect(freshShouldSkip("heavy")).toBe(false);
    });
  });
});
