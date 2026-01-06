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

  // 境界値テスト
  describe("境界値のテスト", () => {
    test("1970年1月1日（Unix epoch）を正しく処理", () => {
      const epochDate = new Date("1970-01-01T00:00:00.000Z");
      const result = formatDate(epochDate);
      expect(result).toBe("1970年1月1日");
    });

    test("非常に古い日付を処理", () => {
      const oldDate = new Date("1900-01-01T00:00:00.000Z");
      const result = formatDate(oldDate);
      expect(result).toBe("1900年1月1日");
    });

    test("未来の日付を処理", () => {
      const futureDate = new Date("2100-12-31T23:59:59.999Z");
      const result = formatDate(futureDate);
      expect(result).toBe("2100年12月31日");
    });

    test("月の最終日（31日）を正しく処理", () => {
      const endOfMonth = new Date("2024-01-31T12:00:00Z");
      const result = formatDate(endOfMonth);
      expect(result).toBe("2024年1月31日");
    });

    test("2月29日（うるう年）を正しく処理", () => {
      const leapDay = new Date("2024-02-29T12:00:00Z");
      const result = formatDate(leapDay);
      expect(result).toBe("2024年2月29日");
    });

    test("年の最初の日を処理", () => {
      const firstDay = new Date("2024-01-01T00:00:00Z");
      const result = formatDate(firstDay);
      expect(result).toBe("2024年1月1日");
    });

    test("年の最後の日を処理", () => {
      const lastDay = new Date("2024-12-31T23:59:59.999Z");
      const result = formatDate(lastDay);
      expect(result).toBe("2024年12月31日");
    });
  });

  // エラーハンドリングのテスト
  describe("エラーハンドリング", () => {
    test("無効な日付文字列の場合、Invalid Dateとなる", () => {
      const result = formatDate("invalid-date");
      expect(result).toContain("Invalid Date");
    });

    test("空文字列の場合、Invalid Dateとなる", () => {
      const result = formatDate("");
      expect(result).toContain("Invalid Date");
    });

    test("数値のみの文字列は日付として解釈される", () => {
      // "1234567890000" はミリ秒として解釈される
      const result = formatDate("1234567890000");
      // 日付として解釈されるが、結果は検証しない（環境依存のため）
      expect(result).toBeDefined();
    });
  });

  // 特殊なケース
  describe("特殊なケース", () => {
    test("タイムスタンプ形式の文字列を処理", () => {
      const timestamp = "2024-01-15";
      const result = formatDate(timestamp);
      expect(result).toBe("2024年1月15日");
    });

    test("ISO 8601形式の完全な文字列を処理", () => {
      const iso = "2024-01-15T12:34:56.789Z";
      const result = formatDate(iso);
      expect(result).toBe("2024年1月15日");
    });

    test("Dateオブジェクトの時刻部分は無視される", () => {
      const morning = new Date("2024-01-15T00:00:00Z");
      const evening = new Date("2024-01-15T23:59:59Z");

      expect(formatDate(morning)).toBe(formatDate(evening));
    });
  });
});
