/**
 * Performance Tests Utilities
 *
 * パフォーマンステストで使用する共通のユーティリティ関数を提供します。
 */

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
 * 実行時間を測定するデコレーター
 */
export function measureExecutionTime<T extends (...args: unknown[]) => unknown>(
  fn: T,
  label?: string,
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    const duration = end - start;

    if (label) {
      console.log(`${label}: ${duration.toFixed(2)}ms`);
    }

    return result;
  }) as T;
}

/**
 * 非同期実行時間を測定
 */
export async function measureAsyncExecutionTime<T>(
  promise: Promise<T>,
  label?: string,
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await promise;
  const end = performance.now();
  const duration = end - start;

  if (label) {
    console.log(`${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * ファイルサイズを人間が読みやすい形式に変換
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * パフォーマンステストのスキップ条件を判定
 */
export function shouldSkipPerformanceTest(reason?: string): boolean {
  // CI環境以外では一部のテストをスキップ
  if (!TEST_ENVIRONMENT.isCI && reason === "ci-only") {
    return true;
  }

  // ローカル環境で重いテストをスキップ
  if (TEST_ENVIRONMENT.isLocal && reason === "heavy") {
    return true;
  }

  return false;
}

/**
 * Lighthouse結果からCore Web Vitalsを取得
 */
export function extractCoreWebVitals(lighthouseResult: any) {
  const audits = lighthouseResult.lhr.audits;

  return {
    lcp: audits["largest-contentful-paint"]?.numericValue || 0,
    fid: audits["max-potential-fid"]?.numericValue || 0,
    cls: audits["cumulative-layout-shift"]?.numericValue || 0,
    performance: lighthouseResult.lhr.categories.performance.score * 100,
  };
}

/**
 * バンドルサイズ情報を解析
 */
export function analyzeBundleSize(stats: {
  chunks?: Array<{ names?: string[]; size?: number; files?: string[] }>;
  assets?: Array<{ name: string; size?: number }>;
}) {
  const chunks = stats.chunks || [];
  const assets = stats.assets || [];

  return {
    totalSize: assets.reduce((sum, asset) => sum + (asset.size || 0), 0),
    chunks: chunks.map((chunk) => ({
      name: chunk.names?.[0] || "unknown",
      size: chunk.size || 0,
      files: chunk.files || [],
    })),
    assets: assets.map((asset) => ({
      name: asset.name,
      size: asset.size || 0,
    })),
  };
}
