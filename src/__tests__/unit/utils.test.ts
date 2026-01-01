import { describe, expect, test } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  test("複数のクラス名を結合", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  test("Tailwind Mergeが正しく動作（重複クラスを上書き）", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  test("条件付きクラス名を処理", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    expect(cn("foo", true && "bar", "baz")).toBe("foo bar baz");
  });

  test("undefined/nullを無視", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  test("clsxとtailwind-mergeの組み合わせ", () => {
    expect(cn("bg-red-500", "text-white", "bg-blue-500", "p-4")).toBe("text-white bg-blue-500 p-4");
  });

  test("空文字列を無視", () => {
    expect(cn("foo", "", "bar")).toBe("foo bar");
  });

  test("配列形式のクラス名を処理", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  test("オブジェクト形式のクラス名を処理", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  test("複数の形式を組み合わせ", () => {
    expect(
      cn(
        "base-class",
        { conditional: true, hidden: false },
        ["array-class-1", "array-class-2"],
        "string-class",
      ),
    ).toBe("base-class conditional array-class-1 array-class-2 string-class");
  });

  test("Tailwindの競合するユーティリティクラスをマージ", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
    expect(cn("flex", "grid")).toBe("grid");
  });
});
