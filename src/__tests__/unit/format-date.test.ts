import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { formatDate } from "@/lib/format-date";

describe("formatDate", () => {
  beforeEach(() => {
    // タイムゾーンを固定するためにfake timersを使用
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("Dateオブジェクトを日本語形式でフォーマット", () => {
    const date = new Date("2024-01-15T12:00:00Z");
    const result = formatDate(date);
    expect(result).toBe("2024年1月15日");
  });

  test("ISO文字列を正しく処理", () => {
    const result = formatDate("2024-01-15T12:00:00Z");
    expect(result).toBe("2024年1月15日");
  });

  test("異なる日付形式でも正しく処理", () => {
    const date1 = new Date("2024-12-31T12:00:00Z");
    const result1 = formatDate(date1);
    expect(result1).toBe("2024年12月31日");

    const date2 = new Date("2023-06-01T12:00:00Z");
    const result2 = formatDate(date2);
    expect(result2).toBe("2023年6月1日");
  });

  test("年月日のフォーマットが正しい", () => {
    const date = new Date("2024-03-15T12:00:00Z");
    const result = formatDate(date);
    expect(result).toBe("2024年3月15日");
  });

  test("異なるタイムゾーンの日付でも処理可能", () => {
    // UTC日付
    const utcDate = new Date("2024-01-15T00:00:00.000Z");
    const utcResult = formatDate(utcDate);
    expect(utcResult).toBe("2024年1月15日");

    // ローカル日付（固定されたタイムゾーン内）
    const localDate = new Date("2024-01-15T12:00:00");
    const localResult = formatDate(localDate);
    expect(localResult).toBe("2024年1月15日");
  });
});
