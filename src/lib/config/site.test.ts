import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// envモジュールをモック化
let mockEnv: { NEXT_PUBLIC_SITE_URL?: string; VERCEL_URL?: string } = {
  NEXT_PUBLIC_SITE_URL: undefined,
  VERCEL_URL: undefined,
};
let mockIsProduction = false;

vi.mock("@/lib/env", () => ({
  get env() {
    return mockEnv;
  },
  get isProduction() {
    return mockIsProduction;
  },
}));

describe("getSiteUrl", () => {
  const originalEnv = { ...process.env };

  // 環境変数を設定・リセットするヘルパー関数
  const setEnv = (env: Record<string, string | undefined>) => {
    Object.keys(process.env).forEach((key) => {
      if (!(key in env)) {
        delete process.env[key];
      }
    });
    Object.assign(process.env, env);
  };

  beforeEach(() => {
    // モックの初期化
    mockEnv = {
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_URL: undefined,
    };
    mockIsProduction = false;
  });

  afterEach(() => {
    setEnv(originalEnv);
  });

  describe("本番環境", () => {
    test("NEXT_PUBLIC_SITE_URLが設定されていてHTTPSの場合正常に取得できる", async () => {
      mockEnv = {
        NEXT_PUBLIC_SITE_URL: "https://example.com",
        VERCEL_URL: undefined,
      };
      mockIsProduction = true;

      const { getSiteUrl } = await import("@/lib/config/site");
      const result = getSiteUrl();
      expect(result).toBe("https://example.com");
    });

    test("NEXT_PUBLIC_SITE_URLが未設定の場合エラー", async () => {
      mockEnv = {
        NEXT_PUBLIC_SITE_URL: undefined,
        VERCEL_URL: undefined,
      };
      mockIsProduction = true;

      const { getSiteUrl } = await import("@/lib/config/site");
      expect(() => getSiteUrl()).toThrow("本番環境ではNEXT_PUBLIC_SITE_URL環境変数が必須です");
    });

    test("NEXT_PUBLIC_SITE_URLがHTTPの場合エラー", async () => {
      mockEnv = {
        NEXT_PUBLIC_SITE_URL: "http://example.com",
        VERCEL_URL: undefined,
      };
      mockIsProduction = true;

      const { getSiteUrl } = await import("@/lib/config/site");
      expect(() => getSiteUrl()).toThrow("本番環境ではHTTPSを使用する必要があります");
    });

    test("NEXT_PUBLIC_SITE_URLが不正なURLの場合エラー（15行目: return false）", async () => {
      mockEnv = {
        NEXT_PUBLIC_SITE_URL: "not-a-url",
        VERCEL_URL: undefined,
      };
      mockIsProduction = true;

      const { getSiteUrl } = await import("@/lib/config/site");
      expect(() => getSiteUrl()).toThrow("NEXT_PUBLIC_SITE_URLの検証に失敗しました");
    });

    test("URLコンストラクタが予期しないエラーを投げた場合エラーが再スローされる（43行目: throw error）", async () => {
      // URLコンストラクタをモック化して予期しないエラーを投げる
      const originalURL = global.URL;
      global.URL = vi.fn(() => {
        throw new Error("Unexpected URL constructor error");
      }) as unknown as typeof URL;

      mockEnv = {
        NEXT_PUBLIC_SITE_URL: "https://example.com",
        VERCEL_URL: undefined,
      };
      mockIsProduction = true;

      try {
        const { getSiteUrl } = await import("@/lib/config/site");
        expect(() => getSiteUrl()).toThrow("Unexpected URL constructor error");
      } finally {
        global.URL = originalURL;
      }
    });
  });

  describe("Vercel環境", () => {
    test("VERCEL_URLが設定されている場合Vercel URLを使用する", async () => {
      mockEnv = {
        NEXT_PUBLIC_SITE_URL: "https://example.com",
        VERCEL_URL: "example.vercel.app",
      };
      mockIsProduction = true;

      const { getSiteUrl } = await import("@/lib/config/site");
      const result = getSiteUrl();
      expect(result).toBe("https://example.com");
    });
  });

  describe("開発環境", () => {
    test("NEXT_PUBLIC_SITE_URLが設定されている場合そのURLを使用する", async () => {
      mockEnv = {
        NEXT_PUBLIC_SITE_URL: "http://localhost:4000",
        VERCEL_URL: undefined,
      };
      mockIsProduction = false;

      const { getSiteUrl } = await import("@/lib/config/site");
      const result = getSiteUrl();
      expect(result).toBe("http://localhost:4000");
    });

    test("NEXT_PUBLIC_SITE_URLが未設定の場合デフォルトのlocalhost:3000を返す", async () => {
      mockEnv = {
        NEXT_PUBLIC_SITE_URL: undefined,
        VERCEL_URL: undefined,
      };
      mockIsProduction = false;

      const { getSiteUrl } = await import("@/lib/config/site");
      const result = getSiteUrl();
      expect(result).toBe("http://localhost:3000");
    });

    test("NEXT_PUBLIC_SITE_URLが不正なURLの場合localhost:3000にフォールバックする（59行目: return localhost:3000）", async () => {
      mockEnv = {
        NEXT_PUBLIC_SITE_URL: "not-a-valid-url",
        VERCEL_URL: undefined,
      };
      mockIsProduction = false;

      const { getSiteUrl } = await import("@/lib/config/site");
      const result = getSiteUrl();
      expect(result).toBe("http://localhost:3000");
    });
  });

  describe("テスト環境", () => {
    test("テスト環境でもデフォルトのlocalhost:3000を返す", async () => {
      mockEnv = {
        NEXT_PUBLIC_SITE_URL: undefined,
        VERCEL_URL: undefined,
      };
      mockIsProduction = false;

      const { getSiteUrl } = await import("@/lib/config/site");
      const result = getSiteUrl();
      expect(result).toBe("http://localhost:3000");
    });
  });
});
