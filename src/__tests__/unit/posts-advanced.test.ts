import { describe, expect, test, vi } from "vitest";
import {
  findPostBySlug as findPostBySlugPayload,
  findPosts as findPostsPayload,
} from "@/lib/api/payload-client";
import { getPostBySlug, getPosts } from "@/lib/posts";

// Payload Clientをモック
vi.mock("@/lib/api/payload-client");

describe("Posts - エッジケースとエラーハンドリング", () => {
  describe("getPostBySlug", () => {
    test("空文字列のslugでNOT_FOUNDエラーを返す", async () => {
      vi.mocked(findPostBySlugPayload).mockResolvedValueOnce({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        hasPrevPage: false,
        hasNextPage: false,
      });

      const result = await getPostBySlug("");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("NOT_FOUND");
      }
    });

    test("特殊文字を含むslugを正しく処理する", async () => {
      const specialSlug = "test-<script>alert('xss')</script>";

      vi.mocked(findPostBySlugPayload).mockResolvedValueOnce({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        hasPrevPage: false,
        hasNextPage: false,
      });

      const result = await getPostBySlug(specialSlug);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("NOT_FOUND");
      }
    });

    test("非常に長いslugを処理する", async () => {
      const longSlug = "a".repeat(1000);

      vi.mocked(findPostBySlugPayload).mockResolvedValueOnce({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        hasPrevPage: false,
        hasNextPage: false,
      });

      const result = await getPostBySlug(longSlug);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("NOT_FOUND");
      }
    });

    test("Payload API呼び出しエラー時にUNKNOWNエラーを返す", async () => {
      vi.mocked(findPostBySlugPayload).mockRejectedValueOnce(
        new Error("Database connection failed"),
      );

      const result = await getPostBySlug("test-slug");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("UNKNOWN");
      }
    });

    test("nullを返すPayload APIレスポンスを正しく処理する", async () => {
      vi.mocked(findPostBySlugPayload).mockResolvedValueOnce({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        hasPrevPage: false,
        hasNextPage: false,
      });

      const result = await getPostBySlug("non-existent");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("NOT_FOUND");
      }
    });

    test("draft=trueとoverrideAccess=trueが正しく渡される", async () => {
      const mockPost = {
        id: 1,
        title: "Draft Post",
        slug: "draft-post",
        _status: "draft" as const,
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(findPostBySlugPayload).mockResolvedValueOnce({
        docs: [mockPost],
        totalDocs: 1,
        totalPages: 1,
        hasPrevPage: false,
        hasNextPage: false,
      });

      await getPostBySlug("draft-post", { draft: true, overrideAccess: true });

      expect(findPostBySlugPayload).toHaveBeenCalledWith("draft-post", {
        draft: true,
        overrideAccess: true,
      });
    });
  });

  describe("getPosts", () => {
    test("ページ番号が0以下の場合でもエラーにならない", async () => {
      vi.mocked(findPostsPayload).mockResolvedValueOnce({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        hasPrevPage: false,
        hasNextPage: false,
      });

      const result = await getPosts(0, 10);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.posts).toHaveLength(0);
      }
    });

    test("ページ番号が負の数でもエラーにならない", async () => {
      vi.mocked(findPostsPayload).mockResolvedValueOnce({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        hasPrevPage: false,
        hasNextPage: false,
      });

      const result = await getPosts(-1, 10);

      expect(result.success).toBe(true);
    });

    test("limitが0の場合でもエラーにならない", async () => {
      vi.mocked(findPostsPayload).mockResolvedValueOnce({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        hasPrevPage: false,
        hasNextPage: false,
      });

      const result = await getPosts(1, 0);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.posts).toHaveLength(0);
      }
    });

    test("limitが負の数でもエラーにならない", async () => {
      vi.mocked(findPostsPayload).mockResolvedValueOnce({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        hasPrevPage: false,
        hasNextPage: false,
      });

      const result = await getPosts(1, -10);

      expect(result.success).toBe(true);
    });

    test("非常に大きなページ番号を処理する", async () => {
      vi.mocked(findPostsPayload).mockResolvedValueOnce({
        docs: [],
        totalDocs: 100,
        totalPages: 10,
        hasPrevPage: true,
        hasNextPage: false,
      });

      const result = await getPosts(9999, 10);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.posts).toHaveLength(0);
        expect(result.data.totalPages).toBe(10);
      }
    });

    test("非常に大きなlimit値を処理する", async () => {
      vi.mocked(findPostsPayload).mockResolvedValueOnce({
        docs: [],
        totalDocs: 100,
        totalPages: 1,
        hasPrevPage: false,
        hasNextPage: false,
      });

      const result = await getPosts(1, 99999);

      expect(result.success).toBe(true);
    });

    test("Payload API呼び出しエラー時にDB_ERRORを返す", async () => {
      vi.mocked(findPostsPayload).mockRejectedValueOnce(new Error("Database query failed"));

      const result = await getPosts(1, 10);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("DB_ERROR");
      }
    });

    test("totalPagesがundefinedの場合、0として扱う", async () => {
      vi.mocked(findPostsPayload).mockResolvedValueOnce({
        docs: [],
        totalDocs: 0,
        totalPages: undefined,
        hasPrevPage: false,
        hasNextPage: false,
      });

      const result = await getPosts(1, 10);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalPages).toBe(0);
      }
    });

    test("draft=trueとoverrideAccess=trueが正しく渡される", async () => {
      vi.mocked(findPostsPayload).mockResolvedValueOnce({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        hasPrevPage: false,
        hasNextPage: false,
      });

      await getPosts(1, 10, { draft: true, overrideAccess: true });

      expect(findPostsPayload).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        draft: true,
        overrideAccess: true,
      });
    });

    test("デフォルト引数が正しく適用される", async () => {
      vi.mocked(findPostsPayload).mockResolvedValueOnce({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        hasPrevPage: false,
        hasNextPage: false,
      });

      await getPosts();

      // デフォルト: page=1, limit=BLOG_CONFIG.POSTS_PER_PAGE (12)
      expect(findPostsPayload).toHaveBeenCalledWith({
        page: 1,
        limit: 12,
        draft: false,
        overrideAccess: false,
      });
    });
  });

  describe("同時実行とキャッシュの整合性", () => {
    test("同じslugで複数回呼び出してもキャッシュにより一貫した結果を返す", async () => {
      const mockPost = {
        id: 1,
        title: "Test Post",
        slug: "test-post",
        _status: "published" as const,
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(findPostBySlugPayload).mockResolvedValue({
        docs: [mockPost],
        totalDocs: 1,
        totalPages: 1,
        hasPrevPage: false,
        hasNextPage: false,
      });

      const results = await Promise.all([
        getPostBySlug("test-post"),
        getPostBySlug("test-post"),
        getPostBySlug("test-post"),
      ]);

      // すべて同じ結果を返すことを確認
      expect(results[0]).toEqual(results[1]);
      expect(results[1]).toEqual(results[2]);

      // 全て成功していることを確認
      for (const result of results) {
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.slug).toBe("test-post");
        }
      }
    });

    test("同じページで複数回呼び出してもキャッシュにより一貫した結果を返す", async () => {
      vi.mocked(findPostsPayload).mockResolvedValue({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        hasPrevPage: false,
        hasNextPage: false,
      });

      const results = await Promise.all([getPosts(1, 10), getPosts(1, 10), getPosts(1, 10)]);

      // すべて同じ結果を返すことを確認
      expect(results[0]).toEqual(results[1]);
      expect(results[1]).toEqual(results[2]);

      // 全て成功していることを確認
      for (const result of results) {
        expect(result.success).toBe(true);
      }
    });
  });
});
