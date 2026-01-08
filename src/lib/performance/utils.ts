/**
 * Performance Tests Utilities
 *
 * パフォーマンステストで使用する共通のユーティリティ関数を提供します。
 */

// knip: ignore

import { PERFORMANCE_THRESHOLDS, TEST_ENVIRONMENT } from "./config";

/**
 * パフォーマンス指標を検証し、閾値を超えている場合はエラーを投げる
 */
export function assertPerformanceThreshold<T extends keyof typeof PERFORMANCE_THRESHOLDS>(
  category: T,
  metric: keyof (typeof PERFORMANCE_THRESHOLDS)[T],
  actualValue: number,
  unit: string = "",
): void {
  const threshold = PERFORMANCE_THRESHOLDS[category][metric] as number;

  if (typeof threshold !== "number") {
    throw new Error(`Invalid threshold configuration for ${category}.${String(metric)}`);
  }

  if (actualValue > threshold) {
    throw new Error(
      `Performance threshold exceeded: ${category}.${String(metric)} = ${actualValue}${unit} (threshold: ${threshold}${unit})`,
    );
  }
}

/**
 * メモリ使用量をMB単位で取得
 */
export function getMemoryUsage(): number {
  const usage = process.memoryUsage();
  return Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100;
}

/**
 * パフォーマンステストのスキップ条件を判定
 */
export function shouldSkipPerformanceTest(reason?: string): boolean {
  // CI環境以外では一部のテストをスキップ
  if (process.env.CI !== "true" && reason === "ci-only") {
    return true;
  }

  // ローカル環境で重いテストをスキップ
  if (process.env.NODE_ENV === "development" && process.env.CI !== "true" && reason === "heavy") {
    return true;
  }

  return false;
}
