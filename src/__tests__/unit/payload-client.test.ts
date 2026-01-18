import type { Payload } from "payload";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  clearPayloadCache,
  findPostBySlug,
  findPosts,
  findPublishedPostSlugs,
} from "@/lib/api/payload-client";

// payload-client.tsの内部関数をテストするためにモック化
vi.mock("@payload-config", () => ({
  default: {},
}));
vi.mock("payload", () => ({
  getPayload: vi.fn(),
}));
vi.mock("@/lib/constants", () => ({
  BLOG_CONFIG: {
    PAGINATION_PAGE_SIZE_SSG: 10,
  },
}));
vi.mock("@/lib/api/payload-filters", () => ({
  buildPublishStatusFilter: vi.fn(() => ({ _status: { equals: "published" } })),
  buildSlugFilter: vi.fn(() => ({ slug: { equals: "test-post" } })),
}));

// 実際のテストではgetPayloadとpayloadインスタンスをモック化

// Payloadのモック
const mockPayload = {
  find: vi.fn(),
} as unknown as Payload;

// findメソッドをモック化
const mockFind = vi.mocked(mockPayload.find);

// getPayloadのモックを取得
import { getPayload } from "payload";

const mockGetPayload = vi.mocked(getPayload);

describe("payload-client public API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearPayloadCache();
    mockGetPayload.mockResolvedValue(mockPayload);
    mockFind.mockResolvedValue({
      docs: [],
      totalDocs: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
    clearPayloadCache();
  });

  describe("findPostBySlug", () => {
    test("正常に記事を取得できる", async () => {
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
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
        pagingCounter: 1,
      };

      mockFind.mockResolvedValue(mockResult as any);

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
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
      expect(mockFind).toHaveBeenCalledWith({
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
      mockFind.mockRejectedValue(new Error("test error"));

      const result = await findPostBySlug("test-post");

      expect(result).toEqual({
        docs: [],
        totalDocs: 0,
      });
    });

    test("ネットワークエラーの場合はリトライして成功する", async () => {
      const networkError = new Error("fetch failed: ECONNREFUSED");
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
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
        pagingCounter: 1,
      };

      mockFind.mockRejectedValueOnce(networkError).mockResolvedValueOnce(mockResult);

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
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
      expect(mockFind).toHaveBeenCalledTimes(2);
    });

    test("タイムアウトエラーの場合はリトライして成功する", async () => {
      const timeoutError = new Error("Request timeout occurred");
      const mockResult = {
        docs: [{ id: 1, title: "Test Post", slug: "test-post" }],
        totalDocs: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
        pagingCounter: 1,
      };

      mockFind.mockRejectedValueOnce(timeoutError).mockResolvedValueOnce(mockResult as any);

      const result = await findPostBySlug("test-post");

      expect(result).toEqual(mockResult);
      expect(mockFind).toHaveBeenCalledTimes(2);
    });

    test("CORSエラーの場合は即座に失敗する", async () => {
      const corsError = new Error("CORS policy violation blocked request");

      mockFind.mockRejectedValue(corsError);

      const result = await findPostBySlug("test-post");

      expect(result).toEqual({
        docs: [],
        totalDocs: 0,
      });
      expect(mockFind).toHaveBeenCalledTimes(1);
    });

    test("データベースエラーの場合は即座に失敗する", async () => {
      const dbError = new Error("SQLITE_ERROR: database is locked");

      mockFind.mockRejectedValue(dbError);

      const result = await findPostBySlug("test-post");

      expect(result).toEqual({
        docs: [],
        totalDocs: 0,
      });
      expect(mockFind).toHaveBeenCalledTimes(1);
    });
  });

  describe("findPosts", () => {
    test("正常に記事一覧を取得できる", async () => {
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
        limit: 10,
        pagingCounter: 1,
      };

      mockFind.mockResolvedValue(mockResult as any);

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
      expect(mockFind).toHaveBeenCalledWith({
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

  describe("findPublishedPostSlugs", () => {
    test("正常に公開記事のスラッグ一覧を取得できる", async () => {
      const mockResult = {
        docs: [{ slug: "post-1" }, { slug: "post-2" }, { slug: "post-3" }],
        totalPages: 1,
        totalDocs: 3,
        hasNextPage: false,
        hasPrevPage: false,
      };

      mockFind.mockResolvedValue(mockResult as any);

      const result = await findPublishedPostSlugs();

      expect(result).toEqual([{ slug: "post-1" }, { slug: "post-2" }, { slug: "post-3" }]);
      expect(mockFind).toHaveBeenCalledWith({
        collection: "posts",
        where: { _status: { equals: "published" } },
        limit: 10, // BLOG_CONFIG.PAGINATION_PAGE_SIZE_SSG
        page: 1,
        select: { slug: true },
      });
    });

    test("複数ページにわたるスラッグを取得できる", async () => {
      const mockFirstPage = {
        docs: [{ slug: "post-1" }, { slug: "post-2" }],
        totalPages: 2,
        totalDocs: 4,
        hasNextPage: true,
        hasPrevPage: false,
      };

      const mockSecondPage = {
        docs: [{ slug: "post-3" }, { slug: "post-4" }],
        totalPages: 2,
        totalDocs: 4,
        hasNextPage: false,
        hasPrevPage: true,
      };

      mockFind
        .mockResolvedValueOnce(mockFirstPage as any)
        .mockResolvedValueOnce(mockSecondPage as any);

      const result = await findPublishedPostSlugs();

      expect(result).toEqual([
        { slug: "post-1" },
        { slug: "post-2" },
        { slug: "post-3" },
        { slug: "post-4" },
      ]);
      expect(mockFind).toHaveBeenCalledTimes(2);
    });

    test("slugが空の記事は除外される", async () => {
      const mockResult = {
        docs: [{ slug: "post-1" }, { slug: "" }, { slug: "post-3" }],
        totalPages: 1,
        totalDocs: 3,
        hasNextPage: false,
        hasPrevPage: false,
      };

      mockFind.mockResolvedValue(mockResult as any);

      const result = await findPublishedPostSlugs();

      expect(result).toEqual([{ slug: "post-1" }, { slug: "post-3" }]);
    });

    test("エラー時は空の配列を返す", async () => {
      mockFind.mockRejectedValue(new Error("test error"));

      const result = await findPublishedPostSlugs();

      expect(result).toEqual([]);
    });

    test("並列処理で大量のスラッグを取得できる", async () => {
      // 5ページ分のデータを生成 (5 * 10 = 50件)
      const generatePageData = (page: number, pageSize: number = 10) => {
        const docs = Array.from({ length: pageSize }, (_, i) => ({
          slug: `post-${(page - 1) * pageSize + i + 1}`,
        }));
        return {
          docs,
          totalPages: 5,
          totalDocs: 50,
          hasNextPage: page < 5,
          hasPrevPage: page > 1,
          limit: 10,
          pagingCounter: (page - 1) * 10 + 1,
        };
      };

      // 各ページのモックレスポンスを設定
      mockFind
        .mockResolvedValueOnce(generatePageData(1) as any)
        .mockResolvedValueOnce(generatePageData(2) as any)
        .mockResolvedValueOnce(generatePageData(3) as any)
        .mockResolvedValueOnce(generatePageData(4) as any)
        .mockResolvedValueOnce(generatePageData(5) as any);

      const result = await findPublishedPostSlugs();

      expect(result).toHaveLength(50);
      expect(result[0]).toEqual({ slug: "post-1" });
      expect(result[49]).toEqual({ slug: "post-50" });
      expect(mockFind).toHaveBeenCalledTimes(5);
    });

    test("findPublishedPostSlugsでエラーが発生した場合空配列を返す", async () => {
      mockFind.mockRejectedValue(new Error("Database connection failed"));

      const result = await findPublishedPostSlugs();

      expect(result).toEqual([]);
      expect(mockFind).toHaveBeenCalledTimes(1);
    });
  });
});
