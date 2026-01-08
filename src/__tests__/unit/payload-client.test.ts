import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { clearPayloadCache, findPostBySlug, findPosts } from "@/lib/api/payload-client";

// payload-client.tsの内部関数をテストするためにモック化
vi.mock("@payload-config", () => ({}));
vi.mock("payload", () => ({
  getPayload: vi.fn(),
}));
vi.mock("@/lib/constants", () => ({
  BLOG_CONFIG: {
    PAGINATION_PAGE_SIZE_SSG: 10,
  },
}));
vi.mock("@/lib/api/payload-filters", () => ({
  buildPublishStatusFilter: vi.fn(),
  buildSlugFilter: vi.fn(),
}));

// findPayload関数をモックするための準備

// モックを保存するための変数
let originalFindPayload: any;

describe("payload-client public API", () => {
  beforeEach(async () => {
    clearPayloadCache();
    // モックの元の関数を保存
    const module = await import("@/lib/api/payload-client");
    originalFindPayload = module.findPayload;
  });

  afterEach(async () => {
    clearPayloadCache();
    // モックを元に戻す
    if (originalFindPayload) {
      const module = await import("@/lib/api/payload-client");
      (module as any).findPayload = originalFindPayload;
    }
  });

  describe("findPostBySlug", () => {
    test("正常に記事を取得できる", async () => {
      // モックを設定してからインポート
      const mockResult = {
        docs: [
          {
            id: 1,
            title: "Test Post",
            slug: "test-post",
            content: {
              root: {
                type: "root",
                children: [],
                direction: null,
                format: "" as const,
                indent: 0,
                version: 1,
              },
            },
            author: 1,
            updatedAt: "2024-01-15T00:00:00.000Z",
            createdAt: "2024-01-15T00:00:00.000Z",
          },
        ],
        totalDocs: 1,
      };

      // findPayload関数をモック - より安全な方法
      const module = await import("@/lib/api/payload-client");
      const originalFindPayload = module.findPayload;
      const findPayloadSpy = vi.fn().mockResolvedValue(mockResult);

      // 一時的に置き換え
      (module as any).findPayload = findPayloadSpy;

      const result = await findPostBySlug("test-post");

      expect(result).toEqual({
        docs: [
          {
            id: 1,
            title: "Test Post",
            slug: "test-post",
            content: {
              root: {
                type: "root",
                children: [],
                direction: null,
                format: "" as const,
                indent: 0,
                version: 1,
              },
            },
            author: 1,
            updatedAt: "2024-01-15T00:00:00.000Z",
            createdAt: "2024-01-15T00:00:00.000Z",
          },
        ],
        totalDocs: 1,
      });
      expect(findPayloadSpy).toHaveBeenCalledWith({
        collection: "posts",
        where: expect.any(Object), // buildSlugFilterの結果
        limit: 1,
        draft: undefined,
        overrideAccess: undefined,
        populate: {
          featuredImage: true,
          author: true,
        },
      });
    });

    test("エラー時は空の結果を返す", async () => {
      const { findPostBySlug } = await import("@/lib/api/payload-client");

      // findPayloadがエラーを投げるようにモック
      const module = await import("@/lib/api/payload-client");
      const originalFindPayload = module.findPayload;
      const findPayloadSpy = vi.fn().mockRejectedValue(new Error("test error"));
      (module as any).findPayload = findPayloadSpy;

      const result = await findPostBySlug("test-post");

      expect(result).toEqual({
        docs: [],
        totalDocs: 0,
      });
    });
  });

  describe("findPosts", () => {
    test("正常に記事一覧を取得できる", async () => {
      const { findPosts } = await import("@/lib/api/payload-client");

      const mockResult = {
        docs: [
          {
            id: 1,
            title: "Test Post",
            content: {
              root: {
                type: "root",
                children: [],
                direction: null,
                format: "" as const,
                indent: 0,
                version: 1,
              },
            },
            author: 1,
            updatedAt: "2024-01-15T00:00:00.000Z",
            createdAt: "2024-01-15T00:00:00.000Z",
          },
        ],
        totalDocs: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };

      const module = await import("@/lib/api/payload-client");
      const originalFindPayload = module.findPayload;
      const findPayloadSpy = vi.fn().mockResolvedValue(mockResult);
      (module as any).findPayload = findPayloadSpy;

      const result = await findPosts({ limit: 10, page: 1 });

      expect(result).toEqual({
        docs: [
          {
            id: 1,
            title: "Test Post",
            content: {
              root: {
                type: "root",
                children: [],
                direction: null,
                format: "" as const,
                indent: 0,
                version: 1,
              },
            },
            author: 1,
            updatedAt: "2024-01-15T00:00:00.000Z",
            createdAt: "2024-01-15T00:00:00.000Z",
          },
        ],
        totalDocs: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
      expect(findPayloadSpy).toHaveBeenCalledWith({
        collection: "posts",
        where: expect.any(Object), // buildPublishStatusFilterの結果
        sort: "-publishedDate",
        limit: 10,
        page: 1,
        draft: undefined,
        overrideAccess: undefined,
        populate: {
          featuredImage: true,
          author: true,
        },
      });
    });
  });

  describe("clearPayloadCache", () => {
    test("Payloadインスタンスのキャッシュをクリアする", () => {
      // この関数は副作用をテストするのが難しいので、
      // 呼び出し可能であることを確認するのみ
      expect(typeof clearPayloadCache).toBe("function");
      expect(() => clearPayloadCache()).not.toThrow();
    });
  });
});
