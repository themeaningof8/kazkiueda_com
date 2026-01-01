import { VALIDATION_LIMITS } from "../constants";

/**
 * タグのバリデーション関数
 * @param value 検証する値
 * @returns 検証成功時はtrue、失敗時はエラーメッセージ
 */
export function validateTag(value: unknown): true | string {
  if (!value || typeof value !== "string") {
    return "タグは必須です";
  }
  if (value.length > VALIDATION_LIMITS.TAG_MAX_LENGTH) {
    return `タグは${VALIDATION_LIMITS.TAG_MAX_LENGTH}文字以内で入力してください`;
  }
  return true;
}

/**
 * タグ配列のバリデーション関数（重複チェック）
 * @param value 検証する値
 * @returns 検証成功時はtrue、失敗時はエラーメッセージ
 */
export function validateTagsArray(value: unknown): true | string {
  if (!Array.isArray(value)) return true;

  // タグ文字列を抽出（小文字に正規化）
  const tags = value
    .map((item: unknown) => {
      if (item && typeof item === "object" && "tag" in item) {
        return (item as { tag: unknown }).tag;
      }
      return undefined;
    })
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.toLowerCase());

  // 重複チェック
  const uniqueTags = new Set(tags);
  if (tags.length !== uniqueTags.size) {
    return "重複するタグがあります";
  }

  return true;
}
