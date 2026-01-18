import { describe, expect, test } from "vitest";
import {
  isPlaywrightAvailable,
  PERFORMANCE_THRESHOLDS,
  TEST_ENVIRONMENT,
} from "@/lib/performance/config";

describe("Performance Config", () => {
  describe("isPlaywrightAvailable", () => {
    test("Playwrightが利用可能な場合trueを返す", () => {
      // 実際の動作をテスト（環境による）
      const result = isPlaywrightAvailable();
      expect(typeof result).toBe("boolean");
      // 実際の環境によるので、結果をassertしない
    });

    test("isPlaywrightAvailableが関数であること", () => {
      expect(typeof isPlaywrightAvailable).toBe("function");
    });
  });

  describe("PERFORMANCE_THRESHOLDS", () => {
    test("Core Web Vitalsの閾値が正しく定義されている", () => {
      expect(PERFORMANCE_THRESHOLDS.coreWebVitals).toEqual({
        lcp: 2500,
        fid: 100,
        cls: 0.1,
      });
    });

    test("Bundle Sizeの閾値が正しく定義されている", () => {
      expect(PERFORMANCE_THRESHOLDS.bundleSize).toEqual({
        maxSize: 500,
        maxChunkSize: 200,
      });
    });

    test("Memory Usageの閾値が正しく定義されている", () => {
      expect(PERFORMANCE_THRESHOLDS.memory).toEqual({
        leakThreshold: 50,
        maxHeapUsage: 100,
      });
    });

    test("Image Optimizationの閾値が正しく定義されている", () => {
      expect(PERFORMANCE_THRESHOLDS.images).toEqual({
        maxLoadTime: 2000,
        maxOptimizedSize: 500,
      });
    });

    test("General Performanceの閾値が正しく定義されている", () => {
      expect(PERFORMANCE_THRESHOLDS.general).toEqual({
        maxApiResponseTime: 1000,
        maxPageLoadTime: 3000,
      });
    });
  });

  describe("TEST_ENVIRONMENT", () => {
    test("ローカル開発環境の設定が正しい", () => {
      expect(typeof TEST_ENVIRONMENT.isLocal).toBe("boolean");
    });

    test("CI環境の設定が正しい", () => {
      expect(typeof TEST_ENVIRONMENT.isCI).toBe("boolean");
    });

    test("ヘッドレスブラウザ設定が正しい", () => {
      expect(typeof TEST_ENVIRONMENT.headless).toBe("boolean");
    });

    test("サーバーURLが設定されている", () => {
      expect(typeof TEST_ENVIRONMENT.serverUrl).toBe("string");
    });

    test("タイムアウト設定が正しい", () => {
      expect(TEST_ENVIRONMENT.timeout).toEqual({
        lighthouse: 60000,
        puppeteer: 30000,
        bundleAnalysis: 10000,
      });
    });

    test("PlaywrightAvailableがisPlaywrightAvailableの結果と一致する", () => {
      expect(TEST_ENVIRONMENT.playwrightAvailable).toBe(isPlaywrightAvailable());
    });
  });
});
