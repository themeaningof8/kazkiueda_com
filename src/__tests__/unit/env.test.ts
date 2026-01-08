import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("env", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // モジュールのキャッシュをクリア
    vi.resetModules();
    // 環境変数をクリア（テスト用に最小限の環境変数だけ残す）
    (process.env as any) = {
      NODE_ENV: "test",
      // 他の環境変数は各テストで明示的に設定
    };
  });

  afterEach(() => {
    // 各テスト後にモジュールのキャッシュをクリアし、環境変数をリセット
    vi.resetModules();
    (process.env as any) = { ...originalEnv };
  });

  describe("validateEnv", () => {
    test("有効な環境変数で正常に検証される", async () => {
      // 環境変数を設定
      process.env.NODE_ENV = "test";
      process.env.PAYLOAD_SECRET = "test-secret-key-that-is-long-enough-for-validation-32-chars";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";

      // モジュールが読み込まれる時点で検証が実行されるため、importでテスト
      await expect(import("@/lib/env")).resolves.toBeDefined();
    });

    test("必須環境変数が不足している場合エラー", async () => {
      process.env.NODE_ENV = "test";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";
      // PAYLOAD_SECRETを未設定

      await expect(import("@/lib/env")).rejects.toThrow();
    });

    test("DATABASE_URLが不正な形式の場合エラー", async () => {
      process.env.NODE_ENV = "test";
      process.env.PAYLOAD_SECRET = "test-secret-key-that-is-long-enough-for-validation-32-chars";
      process.env.DATABASE_URL = "invalid-url";

      await expect(import("@/lib/env")).rejects.toThrow();
    });

    test("PAYLOAD_SECRETが短すぎる場合エラー", async () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: "test",
        PAYLOAD_SECRET: "short",
        DATABASE_URL: "postgresql://user:password@localhost:5432/testdb",
      };

      await expect(import("@/lib/env")).rejects.toThrow();
    });

    test("PAYLOAD_SECRETがデフォルト値の場合エラー", async () => {
      process.env.NODE_ENV = "test";
      process.env.PAYLOAD_SECRET = "your-secret-key";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";

      await expect(import("@/lib/env")).rejects.toThrow();
    });

    test("NODE_ENVが不正な値の場合エラー", async () => {
      process.env.NODE_ENV = "invalid";
      process.env.PAYLOAD_SECRET = "test-secret-key-that-is-long-enough-for-validation-32-chars";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";

      await expect(import("@/lib/env")).rejects.toThrow();
    });

    test("R2設定が部分的に設定されている場合エラー", async () => {
      process.env.NODE_ENV = "test";
      process.env.PAYLOAD_SECRET = "test-secret-key-that-is-long-enough-for-validation-32-chars";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";
      process.env.S3_BUCKET = "test-bucket";
      // 他のR2設定を未設定

      await expect(import("@/lib/env")).rejects.toThrow();
    });

    test("R2設定が全て設定されている場合正常", async () => {
      process.env.NODE_ENV = "test";
      process.env.PAYLOAD_SECRET = "test-secret-key-that-is-long-enough-for-validation-32-chars";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";
      process.env.S3_BUCKET = "test-bucket";
      process.env.S3_ENDPOINT = "https://test.r2.cloudflarestorage.com";
      process.env.S3_ACCESS_KEY_ID = "test-key";
      process.env.S3_SECRET_ACCESS_KEY = "test-secret";
      process.env.S3_REGION = "auto";

      await expect(import("@/lib/env")).resolves.toBeDefined();
    });

    test("本番環境でResend設定が不足している場合エラー", async () => {
      process.env.NODE_ENV = "production";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";
      // Resend設定を未設定

      await expect(import("@/lib/env")).rejects.toThrow();
    });

    test("本番環境でResend設定が全て設定されている場合正常", async () => {
      process.env.NODE_ENV = "production";
      process.env.PAYLOAD_SECRET = "test-secret-key-that-is-long-enough-for-validation-32-chars";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";
      process.env.RESEND_API_KEY = "test-api-key";
      process.env.RESEND_FROM_EMAIL = "test@example.com";
      process.env.RESEND_FROM_NAME = "Test App";

      await expect(import("@/lib/env")).resolves.toBeDefined();
    });

    test("LOG_LEVELが不正な値の場合エラー", async () => {
      process.env.NODE_ENV = "test";
      process.env.PAYLOAD_SECRET = "test-secret-key-that-is-long-enough-for-validation-32-chars";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";
      process.env.LOG_LEVEL = "invalid";

      await expect(import("@/lib/env")).rejects.toThrow();
    });

    test("LOG_LEVELが有効な値の場合正常", async () => {
      process.env.NODE_ENV = "test";
      process.env.PAYLOAD_SECRET = "test-secret-key-that-is-long-enough-for-validation-32-chars";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";
      process.env.LOG_LEVEL = "info";

      await expect(import("@/lib/env")).resolves.toBeDefined();
    });

    test("NEXT_PUBLIC_SITE_URLが不正なURLの場合エラー", async () => {
      process.env.NODE_ENV = "test";
      process.env.PAYLOAD_SECRET = "test-secret-key-that-is-long-enough-for-validation-32-chars";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";
      process.env.NEXT_PUBLIC_SITE_URL = "not-a-url";

      await expect(import("@/lib/env")).rejects.toThrow();
    });
  });

  describe("環境判定関数", () => {
    test("isProductionは本番環境でのみtrue", async () => {
      process.env.NODE_ENV = "production";
      process.env.PAYLOAD_SECRET = "test-secret-key-that-is-long-enough-for-validation-32-chars";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";
      process.env.RESEND_API_KEY = "test-api-key";
      process.env.RESEND_FROM_EMAIL = "test@example.com";
      process.env.RESEND_FROM_NAME = "Test App";

      const { isProduction } = await import("@/lib/env");
      expect(isProduction).toBe(true);
    });

    test("isProductionは開発環境でfalse", async () => {
      process.env.NODE_ENV = "development";
      process.env.PAYLOAD_SECRET = "test-secret-key-that-is-long-enough-for-validation-32-chars";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";

      const { isProduction } = await import("@/lib/env");
      expect(isProduction).toBe(false);
    });

    test("isDevelopmentは開発環境でのみtrue", async () => {
      process.env.NODE_ENV = "development";
      process.env.PAYLOAD_SECRET = "test-secret-key-that-is-long-enough-for-validation-32-chars";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";

      const { isDevelopment } = await import("@/lib/env");
      expect(isDevelopment).toBe(true);
    });

    test("isDevelopmentは本番環境でfalse", async () => {
      process.env.NODE_ENV = "production";
      process.env.PAYLOAD_SECRET = "test-secret-key-that-is-long-enough-for-validation-32-chars";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";
      process.env.RESEND_API_KEY = "test-api-key";
      process.env.RESEND_FROM_EMAIL = "test@example.com";
      process.env.RESEND_FROM_NAME = "Test App";

      const { isDevelopment } = await import("@/lib/env");
      expect(isDevelopment).toBe(false);
    });

    test("isDevelopmentはテスト環境でfalse", async () => {
      process.env.NODE_ENV = "test";
      process.env.PAYLOAD_SECRET = "test-secret-key-that-is-long-enough-for-validation-32-chars";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";

      const { isDevelopment } = await import("@/lib/env");
      expect(isDevelopment).toBe(false);
    });
  });

  describe("型定義", () => {
    test("Env型が正しく推論される", async () => {
      process.env.NODE_ENV = "test";
      process.env.PAYLOAD_SECRET = "test-secret-key-that-is-long-enough-for-validation-32-chars";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";

      const { env } = await import("@/lib/env");

      expect(typeof env.NODE_ENV).toBe("string");
      expect(typeof env.PAYLOAD_SECRET).toBe("string");
      expect(typeof env.DATABASE_URL).toBe("string");
      expect(env.NODE_ENV).toBe("test");
    });

    test("オプショナルな環境変数が正しく処理される", async () => {
      process.env.NODE_ENV = "test";
      process.env.PAYLOAD_SECRET = "test-secret-key-that-is-long-enough-for-validation-32-chars";
      process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";

      const { env } = await import("@/lib/env");

      // オプショナルなフィールドは存在するかundefined
      expect(
        env.NEXT_PUBLIC_SITE_URL === undefined || typeof env.NEXT_PUBLIC_SITE_URL === "string",
      ).toBe(true);
      expect(
        env.PAYLOAD_PREVIEW_SECRET === undefined || typeof env.PAYLOAD_PREVIEW_SECRET === "string",
      ).toBe(true);
    });
  });
});
