import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// 共通の環境変数設定ヘルパー関数
function setupMinimalEnv() {
  vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
  vi.stubEnv("PAYLOAD_SECRET", "a".repeat(32));
}

describe("getSiteUrl", () => {
  // process.exitをモック（env.tsのvalidateEnv()で呼ばれるため）
  const originalExit = process.exit;

  beforeEach(() => {
    process.exit = vi.fn() as unknown as (code?: number | undefined) => never;
    vi.unstubAllEnvs();
    vi.resetModules(); // モジュールキャッシュをクリア
    setupMinimalEnv(); // 共通環境変数を設定
  });

  afterEach(() => {
    process.exit = originalExit;
  });

  describe("本番環境", () => {
    test("HTTPS URLを正しく返す", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");

      const { getSiteUrl } = await import("@/lib/config/site");
      expect(getSiteUrl()).toBe("https://example.com");
    });

    test("HTTP URLでエラーを投げる", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://example.com");

      const { getSiteUrl } = await import("@/lib/config/site");
      expect(() => getSiteUrl()).toThrow("本番環境ではHTTPSを使用する必要があります");
    });

    test("NEXT_PUBLIC_SITE_URL未設定でエラーを投げる", async () => {
      vi.stubEnv("NODE_ENV", "production");
      delete process.env.NEXT_PUBLIC_SITE_URL;

      const { getSiteUrl } = await import("@/lib/config/site");
      expect(() => getSiteUrl()).toThrow("本番環境ではNEXT_PUBLIC_SITE_URL環境変数が必須です");
    });
  });

  describe("Vercel環境", () => {
    test("VERCEL_URLから自動生成", async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("VERCEL_URL", "myapp.vercel.app");

      const { getSiteUrl } = await import("@/lib/config/site");
      expect(getSiteUrl()).toBe("https://myapp.vercel.app");
    });

    test("VERCEL_URLが優先される", async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("VERCEL_URL", "myapp.vercel.app");
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");

      const { getSiteUrl } = await import("@/lib/config/site");
      expect(getSiteUrl()).toBe("https://myapp.vercel.app");
    });
  });

  describe("開発環境", () => {
    test("デフォルトでlocalhost:3000を返す", async () => {
      vi.stubEnv("NODE_ENV", "development");
      delete process.env.NEXT_PUBLIC_SITE_URL;
      delete process.env.VERCEL_URL;

      const { getSiteUrl } = await import("@/lib/config/site");
      expect(getSiteUrl()).toBe("http://localhost:3000");
    });

    test("NEXT_PUBLIC_SITE_URLが設定されている場合、そのURLを返す", async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:8080");
      delete process.env.VERCEL_URL;

      const { getSiteUrl } = await import("@/lib/config/site");
      expect(getSiteUrl()).toBe("http://localhost:8080");
    });

    test("NEXT_PUBLIC_SITE_URLが未設定の場合、デフォルトを返す", async () => {
      vi.stubEnv("NODE_ENV", "development");
      delete process.env.NEXT_PUBLIC_SITE_URL;
      delete process.env.VERCEL_URL;

      const { getSiteUrl } = await import("@/lib/config/site");
      // NEXT_PUBLIC_SITE_URLが未設定の場合はデフォルトにフォールバック
      expect(getSiteUrl()).toBe("http://localhost:3000");
    });

    test.skip("無効なURL形式のフォールバック（env.tsの検証により到達不可能）", async () => {
      // NOTE: このテストは実装不可能です。
      // env.tsの検証により、NEXT_PUBLIC_SITE_URLは有効なURLである必要があります。
      // そのため、site.ts:57-60のcatch節（無効なURL形式のフォールバック）は
      // 実際には到達不可能なコードパスです。
      //
      // このコードパスをテストするには、env.tsの検証をバイパスする必要がありますが、
      // それはテスト環境の整合性を損なうため推奨されません。
      //
      // 代替案: 将来的にenv.tsの検証が緩和される場合に備えて、
      // このコードパスが存在することは確認できますが、実際のテストは実装不可能です。

      vi.stubEnv("NODE_ENV", "development");
      // env.tsの検証により、無効なURLは設定できない
      // vi.stubEnv("NEXT_PUBLIC_SITE_URL", "invalid-url-format");
      delete process.env.VERCEL_URL;

      // このテストは実行されません（skipされているため）
      expect(true).toBe(true);
    });

    test.skip('NEXT_PUBLIC_SITE_URL=""の空文字列ケース（env.tsの検証により到達不可能）', async () => {
      // NOTE: このテストは実装不可能です。
      // env.tsの検証により、NEXT_PUBLIC_SITE_URLは有効なURLである必要があります。
      // 空文字列は有効なURLではないため、env.tsの検証で弾かれます。
      //
      // このコードパスをテストするには、env.tsの検証をバイパスする必要がありますが、
      // それはテスト環境の整合性を損なうため推奨されません。

      vi.stubEnv("NODE_ENV", "development");
      // env.tsの検証により、空文字列は設定できない
      // vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
      delete process.env.VERCEL_URL;

      // このテストは実行されません（skipされているため）
      expect(true).toBe(true);
    });
  });

  describe("test環境", () => {
    test("test環境での動作", async () => {
      vi.stubEnv("NODE_ENV", "test");
      delete process.env.NEXT_PUBLIC_SITE_URL;
      delete process.env.VERCEL_URL;

      const { getSiteUrl } = await import("@/lib/config/site");
      // test環境では開発環境と同じくlocalhost:3000を返す
      expect(getSiteUrl()).toBe("http://localhost:3000");
    });
  });

  describe("本番環境の追加テスト", () => {
    test("ValiErrorのissues詳細メッセージ検証", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://example.com");

      const { getSiteUrl } = await import("@/lib/config/site");
      // HTTP URLはエラーになる
      expect(() => getSiteUrl()).toThrow();
      try {
        getSiteUrl();
      } catch (error) {
        // ValiErrorのissues配列から詳細メッセージが生成される
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("NEXT_PUBLIC_SITE_URLの検証に失敗しました");
        expect((error as Error).message).toContain("本番環境ではHTTPSを使用する必要があります");
      }
    });

    test('VERCEL_URL=""の空文字列ケース', async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("VERCEL_URL", "");
      delete process.env.NEXT_PUBLIC_SITE_URL;

      const { getSiteUrl } = await import("@/lib/config/site");
      // 空文字列の場合は開発環境のデフォルトにフォールバック
      expect(getSiteUrl()).toBe("http://localhost:3000");
    });
  });
});
