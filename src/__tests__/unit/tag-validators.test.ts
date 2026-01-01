import { describe, expect, test } from "vitest";
import { VALIDATION_LIMITS } from "@/lib/constants";
import { validateTag, validateTagsArray } from "@/lib/validators/tag";

describe("validateTag", () => {
  test("正常なタグが通る", () => {
    expect(validateTag("valid-tag")).toBe(true);
    expect(validateTag("React")).toBe(true);
    expect(validateTag("TypeScript 5.0")).toBe(true);
  });

  test("空文字列がエラー", () => {
    expect(validateTag("")).toBe("タグは必須です");
  });

  test("nullがエラー", () => {
    expect(validateTag(null)).toBe("タグは必須です");
  });

  test("undefinedがエラー", () => {
    expect(validateTag(undefined)).toBe("タグは必須です");
  });

  test("非文字列型がエラー", () => {
    expect(validateTag(123)).toBe("タグは必須です");
    expect(validateTag({})).toBe("タグは必須です");
    expect(validateTag([])).toBe("タグは必須です");
    expect(validateTag(true)).toBe("タグは必須です");
  });

  test("長すぎるタグがエラー", () => {
    const longTag = "a".repeat(VALIDATION_LIMITS.TAG_MAX_LENGTH + 1);
    expect(validateTag(longTag)).toBe(
      `タグは${VALIDATION_LIMITS.TAG_MAX_LENGTH}文字以内で入力してください`,
    );
  });

  test("境界値テスト: TAG_MAX_LENGTH文字はOK", () => {
    const maxLengthTag = "a".repeat(VALIDATION_LIMITS.TAG_MAX_LENGTH);
    expect(validateTag(maxLengthTag)).toBe(true);
  });

  test("境界値テスト: TAG_MAX_LENGTH + 1文字はNG", () => {
    const tooLongTag = "a".repeat(VALIDATION_LIMITS.TAG_MAX_LENGTH + 1);
    expect(validateTag(tooLongTag)).toBe(
      `タグは${VALIDATION_LIMITS.TAG_MAX_LENGTH}文字以内で入力してください`,
    );
  });
});

describe("validateTagsArray", () => {
  test("正常な配列が通る（重複なし）", () => {
    expect(validateTagsArray([{ tag: "react" }, { tag: "typescript" }])).toBe(true);
  });

  test("非配列はtrueを返す", () => {
    expect(validateTagsArray(null)).toBe(true);
    expect(validateTagsArray(undefined)).toBe(true);
    expect(validateTagsArray("string")).toBe(true);
    expect(validateTagsArray(123)).toBe(true);
    expect(validateTagsArray({})).toBe(true);
  });

  test("空配列はtrueを返す", () => {
    expect(validateTagsArray([])).toBe(true);
  });

  test("重複タグを検出（大文字小文字を区別しない）", () => {
    expect(
      validateTagsArray([
        { tag: "react" },
        { tag: "React" }, // 重複（小文字正規化後）
      ]),
    ).toBe("重複するタグがあります");
  });

  test("重複タグを検出（TypeScriptの例）", () => {
    expect(
      validateTagsArray([
        { tag: "TypeScript" },
        { tag: "typescript" }, // 重複（小文字正規化後）
      ]),
    ).toBe("重複するタグがあります");
  });

  test("完全一致の重複タグを検出", () => {
    expect(
      validateTagsArray([
        { tag: "react" },
        { tag: "vue" },
        { tag: "react" }, // 完全重複
      ]),
    ).toBe("重複するタグがあります");
  });

  test("tagプロパティがないオブジェクトを無視", () => {
    expect(
      validateTagsArray([
        { tag: "react" },
        { name: "vue" }, // tagプロパティなし
        { tag: "typescript" },
      ]),
    ).toBe(true);
  });

  test("非文字列のtagプロパティを無視", () => {
    expect(
      validateTagsArray([
        { tag: "react" },
        { tag: 123 }, // 数値
        { tag: null }, // null
        { tag: undefined }, // undefined
        { tag: "typescript" },
      ]),
    ).toBe(true);
  });

  test("tagプロパティが非文字列のみの場合、重複チェックされない", () => {
    expect(validateTagsArray([{ tag: 123 }, { tag: 123 }])).toBe(true); // 文字列として抽出されないため、重複チェック対象外
  });

  test("複雑なケース: 重複と非重複が混在", () => {
    expect(
      validateTagsArray([
        { tag: "React" },
        { tag: "Vue" },
        { tag: "react" }, // Reactと重複
      ]),
    ).toBe("重複するタグがあります");
  });

  test("複雑なケース: 非文字列を無視して重複チェック", () => {
    expect(
      validateTagsArray([
        { tag: "react" },
        { tag: 123 }, // 無視
        { tag: null }, // 無視
        { tag: "typescript" },
      ]),
    ).toBe(true);
  });
});
