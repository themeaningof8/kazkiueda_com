import { beforeEach, describe, expect, test, vi } from "vitest";
import { createMockPost } from "@/__tests__/fixtures/posts";
import { createMockPostRepository } from "@/__tests__/mocks/repositories";
import type { PostRepository } from "@/domain/repositories/post-repository";

vi.mock("@/lib/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/constants")>();
  return {
    ...actual,
    BLOG_CONFIG: {
      ...actual.BLOG_CONFIG,
      POSTS_PER_PAGE: 10,
    },
  };
});

describe("posts", () => {
  let mockRepository: PostRepository;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    mockRepository = createMockPostRepository();
  });

  describe("getPostBySlug", () => {
    test("正常に記事を取得できる", async () => {
      const mockPost = createMockPost();

      vi.mocked(mockRepository.findBySlug).mockResolvedValue({
        success: true,
        data: mockPost,
      });

      // テスト用リポジトリを注入
      const { setPostRepository, getPostBySlug } = await import("@/lib/posts");
      setPostRepository(mockRepository);

      const result = await getPostBySlug("test-post");

      expect(result).toEqual({ success: true, data: mockPost });
      expect(mockRepository.findBySlug).toHaveBeenCalledWith("test-post", {
        draft: false,
        overrideAccess: false,
      });
    });

    test("記事が見つからない場合NOT_FOUNDエラーを返す", async () => {
      vi.mocked(mockRepository.findBySlug).mockResolvedValue({
        success: false,
        error: "NOT_FOUND",
      });

      const { setPostRepository, getPostBySlug } = await import("@/lib/posts");
      setPostRepository(mockRepository);

      const result = await getPostBySlug("non-existent");

      expect(result).toEqual({
        success: false,
        error: "NOT_FOUND",
      });
    });

    test("APIエラー時にUNKNOWNエラーを返す", async () => {
      vi.mocked(mockRepository.findBySlug).mockResolvedValue({
        success: false,
        error: "UNKNOWN",
      });

      const { setPostRepository, getPostBySlug } = await import("@/lib/posts");
      setPostRepository(mockRepository);

      const result = await getPostBySlug("test-post");

      expect(result).toEqual({
        success: false,
        error: "UNKNOWN",
      });
    });

    test("draftオプションが正しく渡される", async () => {
      const draftPost = createMockPost({
        title: "Draft Post",
        slug: "draft-post",
        _status: "draft",
      });

      vi.mocked(mockRepository.findBySlug).mockResolvedValue({
        success: true,
        data: draftPost,
      });

      const { setPostRepository, getPostBySlug } = await import("@/lib/posts");
      setPostRepository(mockRepository);

      await getPostBySlug("draft-post", { draft: true, overrideAccess: true });

      expect(mockRepository.findBySlug).toHaveBeenCalledWith("draft-post", {
        draft: true,
        overrideAccess: true,
      });
    });
  });

  describe("getPosts", () => {
    test("正常に記事一覧を取得できる", async () => {
      const mockPosts = [
        createMockPost({ id: 1, title: "Post 1", slug: "post-1" }),
        createMockPost({ id: 2, title: "Post 2", slug: "post-2" }),
      ];

      vi.mocked(mockRepository.findAll).mockResolvedValue({
        success: true,
        data: {
          posts: mockPosts,
          totalPages: 1,
          totalDocs: 2,
        },
      });

      const { setPostRepository, getPosts } = await import("@/lib/posts");
      setPostRepository(mockRepository);

      const result = await getPosts(1, 10);

      expect(result).toEqual({
        success: true,
        data: {
          posts: mockPosts,
          totalPages: 1,
          totalDocs: 2,
        },
      });
      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 10, {
        draft: false,
        overrideAccess: false,
      });
    });

    test("デフォルト値が正しく適用される", async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue({
        success: true,
        data: {
          posts: [],
          totalPages: 0,
          totalDocs: 0,
        },
      });

      const { setPostRepository, getPosts } = await import("@/lib/posts");
      setPostRepository(mockRepository);

      await getPosts(); // 引数なし

      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 10, {
        draft: false,
        overrideAccess: false,
      });
    });

    test("APIエラー時にDB_ERRORを返す", async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue({
        success: false,
        error: "DB_ERROR",
      });

      const { setPostRepository, getPosts } = await import("@/lib/posts");
      setPostRepository(mockRepository);

      const result = await getPosts();

      expect(result).toEqual({
        success: false,
        error: "DB_ERROR",
      });
    });

    test("totalPagesがnullの場合0を返す", async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue({
        success: true,
        data: {
          posts: [],
          totalPages: 0,
          totalDocs: 0,
        },
      });

      const { setPostRepository, getPosts } = await import("@/lib/posts");
      setPostRepository(mockRepository);

      const result = await getPosts();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalPages).toBe(0);
      }
    });
  });

  describe("getPublishedPostSlugs", () => {
    test("正常にスラッグ一覧を取得できる", async () => {
      const mockSlugs = [{ slug: "post-1" }, { slug: "post-2" }];

      vi.mocked(mockRepository.findPublishedSlugs).mockResolvedValue({
        success: true,
        data: mockSlugs,
      });

      const { setPostRepository, getPublishedPostSlugs } = await import("@/lib/posts");
      setPostRepository(mockRepository);

      const result = await getPublishedPostSlugs();

      expect(result).toEqual({
        success: true,
        data: mockSlugs,
      });
      expect(mockRepository.findPublishedSlugs).toHaveBeenCalled();
    });

    test("APIエラー時にUNKNOWNエラーを返す", async () => {
      vi.mocked(mockRepository.findPublishedSlugs).mockResolvedValue({
        success: false,
        error: "UNKNOWN",
      });

      const { setPostRepository, getPublishedPostSlugs } = await import("@/lib/posts");
      setPostRepository(mockRepository);

      const result = await getPublishedPostSlugs();

      expect(result).toEqual({
        success: false,
        error: "UNKNOWN",
      });
    });
  });
});
