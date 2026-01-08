import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("env", () => {
  beforeEach(() => {
    // モジュールのキャッシュをクリア
    vi.resetModules();
  });

  afterEach(() => {
    // 各テスト後にモジュールのキャッシュをクリア
    vi.resetModules();
  });

  describe("validateEnv", () => {
    test("有効な環境変数で正常に検証される", async () => {
      // vi.stubEnvを使って環境変数をモック
      const envStub = vi.stubEnv("NODE_ENV", "test");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");

      // モジュールが読み込まれる時点で検証が実行されるため、importでテスト
      expect(() => {
        require("@/lib/env");
      }).not.toThrow();

      // クリーンアップ
    });

    test("必須環境変数が不足している場合エラー", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "test");
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");
      // PAYLOAD_SECRETを未設定

      expect(() => {
        require("@/lib/env");
      }).toThrow();
    });

    test("DATABASE_URLが不正な形式の場合エラー", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "test");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "invalid-url");

      expect(() => {
        require("@/lib/env");
      }).toThrow();
    });

    test("PAYLOAD_SECRETが短すぎる場合エラー", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "test");
      const secretStub = vi.stubEnv("PAYLOAD_SECRET", "short");
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");

      expect(() => {
        require("@/lib/env");
      }).toThrow();
    });

    test("PAYLOAD_SECRETがデフォルト値の場合エラー", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "test");
      const secretStub = vi.stubEnv("PAYLOAD_SECRET", "your-secret-key");
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");

      expect(() => {
        require("@/lib/env");
      }).toThrow();
    });

    test("NODE_ENVが不正な値の場合エラー", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "invalid");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");

      expect(() => {
        require("@/lib/env");
      }).toThrow();
    });

    test("R2設定が部分的に設定されている場合エラー", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "test");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");
      const bucketStub = vi.stubEnv("S3_BUCKET", "test-bucket");
      // 他のR2設定を未設定

      expect(() => {
        require("@/lib/env");
      }).toThrow();
    });

    test("R2設定が全て設定されている場合正常", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "test");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");
      const bucketStub = vi.stubEnv("S3_BUCKET", "test-bucket");
      const endpointStub = vi.stubEnv("S3_ENDPOINT", "https://test.r2.cloudflarestorage.com");
      const keyStub = vi.stubEnv("S3_ACCESS_KEY_ID", "test-key");
      const secretKeyStub = vi.stubEnv("S3_SECRET_ACCESS_KEY", "test-secret");
      const regionStub = vi.stubEnv("S3_REGION", "auto");

      expect(() => {
        require("@/lib/env");
      }).not.toThrow();
    });

    test("本番環境でResend設定が不足している場合エラー", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "production");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");
      // Resend設定を未設定

      expect(() => {
        require("@/lib/env");
      }).toThrow();
    });

    test("本番環境でResend設定が全て設定されている場合正常", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "production");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");
      const apiKeyStub = vi.stubEnv("RESEND_API_KEY", "test-api-key");
      const emailStub = vi.stubEnv("RESEND_FROM_EMAIL", "test@example.com");
      const nameStub = vi.stubEnv("RESEND_FROM_NAME", "Test App");

      expect(() => {
        require("@/lib/env");
      }).not.toThrow();
    });

    test("LOG_LEVELが不正な値の場合エラー", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "test");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");
      const logStub = vi.stubEnv("LOG_LEVEL", "invalid");

      expect(() => {
        require("@/lib/env");
      }).toThrow();
    });

    test("LOG_LEVELが有効な値の場合正常", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "test");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");
      const logStub = vi.stubEnv("LOG_LEVEL", "info");

      expect(() => {
        require("@/lib/env");
      }).not.toThrow();
    });

    test("NEXT_PUBLIC_SITE_URLが不正なURLの場合エラー", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "test");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");
      const urlStub = vi.stubEnv("NEXT_PUBLIC_SITE_URL", "not-a-url");

      expect(() => {
        require("@/lib/env");
      }).toThrow();
    });
  });

  describe("環境判定関数", () => {
    test("isProductionは本番環境でのみtrue", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "production");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");

      const { isProduction } = require("@/lib/env");
      expect(isProduction).toBe(true);
    });

    test("isProductionは開発環境でfalse", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "development");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");

      const { isProduction } = require("@/lib/env");
      expect(isProduction).toBe(false);
    });

    test("isDevelopmentは開発環境でのみtrue", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "development");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");

      const { isDevelopment } = require("@/lib/env");
      expect(isDevelopment).toBe(true);
    });

    test("isDevelopmentは本番環境でfalse", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "production");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");

      const { isDevelopment } = require("@/lib/env");
      expect(isDevelopment).toBe(false);
    });

    test("isDevelopmentはテスト環境でfalse", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "test");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");

      const { isDevelopment } = require("@/lib/env");
      expect(isDevelopment).toBe(false);
    });
  });

  describe("型定義", () => {
    test("Env型が正しく推論される", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "test");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");

      const { env } = require("@/lib/env");

      expect(typeof env.NODE_ENV).toBe("string");
      expect(typeof env.PAYLOAD_SECRET).toBe("string");
      expect(typeof env.DATABASE_URL).toBe("string");
      expect(env.NODE_ENV).toBe("test");
    });

    test("オプショナルな環境変数が正しく処理される", async () => {
      const envStub = vi.stubEnv("NODE_ENV", "test");
      const secretStub = vi.stubEnv(
        "PAYLOAD_SECRET",
        "test-secret-key-that-is-long-enough-for-validation-32-chars",
      );
      const dbStub = vi.stubEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/testdb");

      const { env } = require("@/lib/env");

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
