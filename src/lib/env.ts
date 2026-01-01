import * as v from "valibot";
import { envLogger } from "./logger";

/**
 * PostgreSQL接続文字列の検証
 */
const postgresUrlSchema = v.pipe(
  v.string(),
  v.minLength(1, "DATABASE_URLは必須です"),
  v.check(
    (input) => input.startsWith("postgresql://") || input.startsWith("postgres://"),
    "DATABASE_URLはpostgresql://またはpostgres://で始まる必要があります",
  ),
);

/**
 * 環境変数のスキーマ定義
 * 開発環境では一部の環境変数をオプショナルにし、本番環境では必須とする
 */
const baseEnvSchema = v.object({
  NODE_ENV: v.pipe(
    v.string(),
    v.picklist(
      ["development", "production", "test"],
      "NODE_ENVはdevelopment、production、testのいずれかである必要があります",
    ),
  ),
  PAYLOAD_SECRET: v.pipe(
    v.string(),
    v.minLength(32, "PAYLOAD_SECRETは32文字以上である必要があります"),
    v.check(
      (input) => input !== "your-secret-key",
      "PAYLOAD_SECRETはデフォルト値（your-secret-key）を使用できません",
    ),
  ),
  DATABASE_URL: postgresUrlSchema,
  NEXT_PUBLIC_SITE_URL: v.optional(
    v.pipe(v.string(), v.url("NEXT_PUBLIC_SITE_URLは有効なURLである必要があります")),
  ),
  PAYLOAD_PREVIEW_SECRET: v.optional(
    v.pipe(v.string(), v.minLength(16, "PAYLOAD_PREVIEW_SECRETは16文字以上である必要があります")),
  ),
  // R2設定（S3_*）は全てセットか全て未設定かのどちらか
  S3_BUCKET: v.optional(v.string()),
  S3_ENDPOINT: v.optional(v.string()),
  S3_ACCESS_KEY_ID: v.optional(v.string()),
  S3_SECRET_ACCESS_KEY: v.optional(v.string()),
  S3_REGION: v.optional(v.string()),
  // Vercel環境変数（自動設定されるため検証のみ）
  VERCEL_URL: v.optional(v.string()),
  // ログレベル（オプショナル）
  LOG_LEVEL: v.optional(
    v.picklist(
      ["fatal", "error", "warn", "info", "debug", "trace"],
      "LOG_LEVELはfatal、error、warn、info、debug、traceのいずれかである必要があります",
    ),
  ),
});

/**
 * R2設定の検証：全てセットか全て未設定かのどちらか
 */
const envSchema = v.pipe(
  baseEnvSchema,
  v.check((data) => {
    const r2Keys = [
      data.S3_BUCKET,
      data.S3_ENDPOINT,
      data.S3_ACCESS_KEY_ID,
      data.S3_SECRET_ACCESS_KEY,
    ];
    const definedCount = r2Keys.filter((key) => key !== undefined).length;
    // 0個（全て未設定）または4個（全てセット）のみ許可
    return definedCount === 0 || definedCount === 4;
  }, "R2ストレージ設定は、すべての環境変数（S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY）を設定するか、すべて未設定にする必要があります"),
);

/**
 * 環境変数を検証して取得
 * エラー時は即座に終了する
 */
function validateEnv() {
  try {
    return v.parse(envSchema, process.env);
  } catch (error) {
    if (error instanceof v.ValiError) {
      const issues = error.issues.map((issue) => {
        const path =
          issue.path?.map((p: { key: string | number | symbol }) => p.key).join(".") || "root";
        return `  - ${path}: ${issue.message}`;
      });
      envLogger.error({ issues }, "環境変数の検証に失敗しました");
      process.exit(1);
    }
    throw error;
  }
}

/**
 * 検証済み環境変数の型
 */
export type Env = v.InferOutput<typeof envSchema>;

/**
 * 検証済み環境変数
 * このモジュールが読み込まれた時点で検証が実行される
 */
export const env: Env = validateEnv();

/**
 * 本番環境かどうか
 */
export const isProduction = env.NODE_ENV === "production";

/**
 * 開発環境かどうか
 */
export const isDevelopment = env.NODE_ENV === "development";
