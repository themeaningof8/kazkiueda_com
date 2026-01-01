import * as v from "valibot";
import { env, isProduction } from "../env";

/**
 * サイトURLのスキーマ（HTTPS必須）
 */
const httpsUrlSchema = v.pipe(
  v.string(),
  v.url("有効なURLである必要があります"),
  v.check((input) => {
    try {
      const url = new URL(input);
      return url.protocol === "https:";
    } catch {
      return false;
    }
  }, "本番環境ではHTTPSを使用する必要があります"),
);

/**
 * サイトのベースURLを取得
 * - 本番環境ではNEXT_PUBLIC_SITE_URLが必須（HTTPS強制）
 * - Vercel環境では自動検出
 * - 開発環境のみlocalhost:3000を許可
 */
export function getSiteUrl(): string {
  // 本番環境ではNEXT_PUBLIC_SITE_URLが必須
  if (isProduction) {
    if (!env.NEXT_PUBLIC_SITE_URL) {
      throw new Error("本番環境ではNEXT_PUBLIC_SITE_URL環境変数が必須です");
    }

    // HTTPSを強制
    try {
      v.parse(httpsUrlSchema, env.NEXT_PUBLIC_SITE_URL);
      const url = new URL(env.NEXT_PUBLIC_SITE_URL);
      return url.origin;
    } catch (error) {
      if (error instanceof v.ValiError) {
        const messages = error.issues.map((issue) => issue.message).join(", ");
        throw new Error(`NEXT_PUBLIC_SITE_URLの検証に失敗しました: ${messages}`);
      }
      throw error;
    }
  }

  // Vercel環境（自動検出）
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }

  // 開発環境のみlocalhost許可
  if (env.NEXT_PUBLIC_SITE_URL) {
    try {
      const url = new URL(env.NEXT_PUBLIC_SITE_URL);
      return url.origin;
    } catch {
      // URL形式が不正な場合はデフォルトにフォールバック
      return "http://localhost:3000";
    }
  }

  return "http://localhost:3000";
}
