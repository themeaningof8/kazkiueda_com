import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createPostRepository } from "@/infrastructure/repositories/create-post-repository";

// PayloadClientのモック
const mockPayloadClient = {
  findPostBySlug: vi.fn(),
  findPosts: vi.fn(),
  findPublishedPostSlugs: vi.fn(),
};

// 共通のテストヘルパー
const createMockPost = (
  id: number = 1,
  title: string = "Test Post",
  slug: string = "test-post",
) => ({
  id,
  title,
  slug,
});

const mockPayloadResponse = (docs: unknown[], totalDocs: number = docs.length) => ({
  docs,
  totalDocs,
});

describe("createPostRepository", () => {
  let repository: ReturnType<typeof createPostRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = createPostRepository(mockPayloadClient as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("findBySlug", () => {
    test.each([
      {
        name: "デフォルトオプションで正常に記事を取得できる",
        options: {},
        expectedCallOptions: {},
      },
      {
        name: "draftオプションを渡せる",
        options: { draft: true },
        expectedCallOptions: { draft: true },
      },
      {
        name: "overrideAccessオプションを渡せる",
        options: { overrideAccess: true },
        expectedCallOptions: { overrideAccess: true },
      },
      {
        name: "全てのオプションを渡せる",
        options: { draft: true, overrideAccess: true },
        expectedCallOptions: { draft: true, overrideAccess: true },
      },
    ])("$name", async ({ options, expectedCallOptions }) => {
      const mockPost = createMockPost();

      mockPayloadClient.findPostBySlug.mockResolvedValue(mockPayloadResponse([mockPost]));

      const result = await repository.findBySlug("test-post", options);

      expect(result).toEqual({
        success: true,
        data: mockPost,
      });
      expect(mockPayloadClient.findPostBySlug).toHaveBeenCalledWith(
        "test-post",
        expectedCallOptions,
      );
    });

    test("記事が見つからない場合NOT_FOUNDエラーを返す", async () => {
      mockPayloadClient.findPostBySlug.mockResolvedValue({
        docs: [],
        totalDocs: 0,
      });

      const result = await repository.findBySlug("non-existent");

      expect(result).toEqual({
        success: false,
        error: "NOT_FOUND",
      });
    });

    test("エラーが発生した場合UNKNOWNエラーを返す", async () => {
      mockPayloadClient.findPostBySlug.mockRejectedValue(new Error("API Error"));

      const result = await repository.findBySlug("test-post");

      expect(result).toEqual({
        success: false,
        error: "UNKNOWN",
      });
    });
  });

  describe("findAll", () => {
    test("正常に記事一覧を取得できる", async () => {
      const mockPosts = [
        { id: 1, title: "Post 1" },
        { id: 2, title: "Post 2" },
      ];

      mockPayloadClient.findPosts.mockResolvedValue({
        docs: mockPosts,
        totalDocs: 2,
        totalPages: 1,
      });

      const result = await repository.findAll(1, 10);

      expect(result).toEqual({
        success: true,
        data: {
          posts: mockPosts,
          totalPages: 1,
          totalDocs: 2,
        },
      });
      expect(mockPayloadClient.findPosts).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    test("オプションを渡せる", async () => {
      const mockPosts = [{ id: 1, title: "Draft Post" }];

      mockPayloadClient.findPosts.mockResolvedValue({
        docs: mockPosts,
        totalDocs: 1,
        totalPages: 1,
      });

      const result = await repository.findAll(1, 5, {
        draft: true,
        overrideAccess: true,
      });

      expect(result).toEqual({
        success: true,
        data: {
          posts: mockPosts,
          totalPages: 1,
          totalDocs: 1,
        },
      });
      expect(mockPayloadClient.findPosts).toHaveBeenCalledWith({
        page: 1,
        limit: 5,
        draft: true,
        overrideAccess: true,
      });
    });

    test("エラーが発生した場合DB_ERRORを返す", async () => {
      mockPayloadClient.findPosts.mockRejectedValue(new Error("Database Error"));

      const result = await repository.findAll(1, 10);

      expect(result).toEqual({
        success: false,
        error: "DB_ERROR",
      });
    });

    test("totalPagesがnullの場合、0を設定する", async () => {
      const mockPosts = [{ id: 1, title: "Post" }];

      mockPayloadClient.findPosts.mockResolvedValue({
        docs: mockPosts,
        totalDocs: 1,
        totalPages: null, // nullの場合のテスト
      });

      const result = await repository.findAll(1, 10);

      expect(result).toEqual({
        success: true,
        data: {
          posts: mockPosts,
          totalPages: 0, // null ?? 0 = 0
          totalDocs: 1,
        },
      });
    });
  });

  describe("findPublishedSlugs", () => {
    test("正常に公開記事のスラッグ一覧を取得できる", async () => {
      const mockSlugs = [{ slug: "post-1" }, { slug: "post-2" }];

      mockPayloadClient.findPublishedPostSlugs.mockResolvedValue(mockSlugs);

      const result = await repository.findPublishedSlugs();

      expect(result).toEqual({
        success: true,
        data: mockSlugs,
      });
      expect(mockPayloadClient.findPublishedPostSlugs).toHaveBeenCalledWith();
    });

    test("エラーが発生した場合UNKNOWNエラーを返す", async () => {
      // このテストケースで55-61行目のエラーハンドリングをカバー
      mockPayloadClient.findPublishedPostSlugs.mockRejectedValue(new Error("API Error"));

      const result = await repository.findPublishedSlugs();

      expect(result).toEqual({
        success: false,
        error: "UNKNOWN",
      });
      expect(mockPayloadClient.findPublishedPostSlugs).toHaveBeenCalledWith();
    });
  });
});
