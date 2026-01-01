import { VALIDATION_LIMITS } from "../constants";

/**
 * スラッグの形式を検証する正規表現
 * URLセーフな文字のみ許可（英数字、ハイフン、アンダースコア）
 */
const SLUG_PATTERN = /^[a-z0-9_-]+$/;

/**
 * スラッグのバリデーション関数
 * @param value 検証する値
 * @returns 検証成功時はtrue、失敗時はエラーメッセージ
 */
export function validateSlug(value: unknown): true | string {
  // スラッグが設定されている場合、URLセーフな形式かチェック
  if (value && typeof value === "string") {
    // URLセーフな文字のみ許可（英数字、ハイフン、アンダースコア）
    if (!SLUG_PATTERN.test(value)) {
      return "スラッグは英数字、ハイフン、アンダースコアのみ使用できます";
    }
    // 長さチェック
    if (value.length > VALIDATION_LIMITS.SLUG_MAX_LENGTH) {
      return `スラッグは${VALIDATION_LIMITS.SLUG_MAX_LENGTH}文字以内で入力してください`;
    }
  }
  return true;
}

/**
 * タイトルからスラッグを自動生成
 * @param title タイトル文字列
 * @returns 生成されたスラッグ、生成できない場合はundefined
 */
export function generateSlugFromTitle(title: string): string | undefined {
  if (!title) return undefined;

  // Unicode正規化（NFD）でアクセント付き文字を分解
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    // 結合文字（アクセントなど）を除去
    .replace(/[\u0300-\u036f]/g, "")
    // URLセーフでない文字を除去
    .replace(/[^\w\s-]/g, "")
    // 連続する空白をハイフンに変換
    .replace(/\s+/g, "-")
    // 先頭・末尾のハイフンを除去
    .replace(/^-+|-+$/g, "");

  // 有効なスラッグが生成できなかった場合はundefinedを返し、必須バリデーションを発動
  return slug.length > 0 ? slug : undefined;
}
