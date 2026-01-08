import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  createMockDraftPost,
  createMockPayloadResponse,
  createMockPost,
} from "@/__tests__/fixtures";

vi.mock("@/lib/api/payload-client", () => ({
  findPostBySlug: vi.fn(),
  findPosts: vi.fn(),
  findPublishedPostSlugs: vi.fn(),
}));

vi.mock("@/lib/constants", () => ({
  BLOG_CONFIG: {
    POSTS_PER_PAGE: 10,
  },
}));

describe("posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPostBySlug", () => {
    test("正常に記事を取得できる", async () => {
      const { getPostBySlug } = await import("@/lib/posts");
      const { findPostBySlug } = await import("@/lib/api/payload-client");

      const mockPost = createMockPost();
      vi.mocked(findPostBySlug).mockResolvedValue({
        docs: [mockPost],
        totalDocs: 1,
      });

      const result = await getPostBySlug("test-post");

      expect(result).toEqual({
        success: true,
        data: mockPost,
      });
      expect(findPostBySlug).toHaveBeenCalledWith("test-post", {
        draft: false,
        overrideAccess: false,
      });
    });

    test("記事が見つからない場合NOT_FOUNDエラーを返す", async () => {
      const { getPostBySlug } = await import("@/lib/posts");
      const { findPostBySlug } = await import("@/lib/api/payload-client");

      vi.mocked(findPostBySlug).mockResolvedValue({
        docs: [],
        totalDocs: 0,
      });

      const result = await getPostBySlug("non-existent");

      expect(result).toEqual({
        success: false,
        error: "NOT_FOUND",
      });
    });

    test("APIエラー時にUNKNOWNエラーを返す", async () => {
      const { getPostBySlug } = await import("@/lib/posts");
      const { findPostBySlug } = await import("@/lib/api/payload-client");

      vi.mocked(findPostBySlug).mockRejectedValue(new Error("API error"));

      const result = await getPostBySlug("test-post");

      expect(result).toEqual({
        success: false,
        error: "UNKNOWN",
      });
    });

    test("draftオプションが正しく渡される", async () => {
      const { getPostBySlug } = await import("@/lib/posts");
      const { findPostBySlug } = await import("@/lib/api/payload-client");

      const mockPost = createMockDraftPost();
      vi.mocked(findPostBySlug).mockResolvedValue({
        docs: [mockPost],
        totalDocs: 1,
      });

      await getPostBySlug("draft-post", { draft: true, overrideAccess: true });

      expect(findPostBySlug).toHaveBeenCalledWith("draft-post", {
        draft: true,
        overrideAccess: true,
      });
    });
  });

  describe("getPosts", () => {
    test("正常に記事一覧を取得できる", async () => {
      const { getPosts } = await import("@/lib/posts");
      const { findPosts } = await import("@/lib/api/payload-client");

      const mockPosts = [
        createMockPost({ id: 1, title: "Post 1", slug: "post-1" }),
        createMockPost({ id: 2, title: "Post 2", slug: "post-2" }),
      ];

      vi.mocked(findPosts).mockResolvedValue(createMockPayloadResponse(mockPosts, 1, 10));

      const result = await getPosts(1, 10);

      expect(result).toEqual({
        success: true,
        data: {
          posts: mockPosts,
          totalPages: 1,
          totalDocs: 2,
        },
      });
      expect(findPosts).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        draft: false,
        overrideAccess: false,
      });
    });

    test("デフォルト値が正しく適用される", async () => {
      const { getPosts } = await import("@/lib/posts");
      const { findPosts } = await import("@/lib/api/payload-client");

      vi.mocked(findPosts).mockResolvedValue({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
      });

      await getPosts(); // 引数なし

      expect(findPosts).toHaveBeenCalledWith({
        page: 1,
        limit: 10, // BLOG_CONFIG.POSTS_PER_PAGE
        draft: false,
        overrideAccess: false,
      });
    });

    test("APIエラー時にDB_ERRORを返す", async () => {
      const { getPosts } = await import("@/lib/posts");
      const { findPosts } = await import("@/lib/api/payload-client");

      vi.mocked(findPosts).mockRejectedValue(new Error("Database error"));

      const result = await getPosts();

      expect(result).toEqual({
        success: false,
        error: "DB_ERROR",
      });
    });

    test("totalPagesがnullの場合0を返す", async () => {
      const { getPosts } = await import("@/lib/posts");
      const { findPosts } = await import("@/lib/api/payload-client");

      vi.mocked(findPosts).mockResolvedValue({
        docs: [],
        totalDocs: 0,
        totalPages: undefined,
        hasNextPage: false,
        hasPrevPage: false,
      });

      const result = await getPosts();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalPages).toBe(0);
      }
    });
  });

  describe("getPublishedPostSlugs", () => {
    test("正常にスラッグ一覧を取得できる", async () => {
      const { getPublishedPostSlugs } = await import("@/lib/posts");
      const { findPublishedPostSlugs } = await import("@/lib/api/payload-client");

      const mockSlugs = [{ slug: "post-1" }, { slug: "post-2" }];

      vi.mocked(findPublishedPostSlugs).mockResolvedValue(mockSlugs);

      const result = await getPublishedPostSlugs();

      expect(result).toEqual({
        success: true,
        data: mockSlugs,
      });
      expect(findPublishedPostSlugs).toHaveBeenCalled();
    });

    test("APIエラー時にUNKNOWNエラーを返す", async () => {
      const { getPublishedPostSlugs } = await import("@/lib/posts");
      const { findPublishedPostSlugs } = await import("@/lib/api/payload-client");

      vi.mocked(findPublishedPostSlugs).mockRejectedValue(new Error("API error"));

      const result = await getPublishedPostSlugs();

      expect(result).toEqual({
        success: false,
        error: "UNKNOWN",
      });
    });
  });
});
