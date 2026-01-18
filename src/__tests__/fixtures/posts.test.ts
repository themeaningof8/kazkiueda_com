import { describe, expect, test } from "vitest";
import {
  createEmptyPayloadResponse,
  createLexicalContent,
  createMockDraftPost,
  createMockPayloadResponse,
  createMockPost,
  createMockPosts,
  mockPostWithEmptyContent,
  mockPostWithLongContent,
  mockPostWithSpecialChars,
} from "@/__tests__/fixtures/posts";

describe("Post Fixtures", () => {
  describe("createLexicalContent", () => {
    test("テキストがある場合に正しい構造を返す", () => {
      const result = createLexicalContent("Hello World");

      expect(result).toEqual({
        root: {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "Hello World",
                  format: 0,
                  version: 1,
                },
              ],
              direction: null,
              format: "",
              indent: 0,
              version: 1,
            },
          ],
          direction: null,
          format: "",
          indent: 0,
          version: 1,
        },
      });
    });

    test("テキストが空の場合に空のchildrenを返す", () => {
      const result = createLexicalContent("");

      expect(result).toEqual({
        root: {
          type: "root",
          children: [],
          direction: null,
          format: "",
          indent: 0,
          version: 1,
        },
      });
    });

    test("テキストが未指定の場合に空のchildrenを返す", () => {
      const result = createLexicalContent();

      expect(result).toEqual({
        root: {
          type: "root",
          children: [],
          direction: null,
          format: "",
          indent: 0,
          version: 1,
        },
      });
    });
  });

  describe("createMockPost", () => {
    test("デフォルト値で記事オブジェクトを作成する", () => {
      const result = createMockPost();

      expect(result).toEqual({
        id: 1,
        title: "Test Post",
        slug: "test-post",
        content: createLexicalContent("Test content"),
        author: 1,
        updatedAt: "2024-01-15T00:00:00.000Z",
        createdAt: "2024-01-15T00:00:00.000Z",
        publishedDate: "2024-01-15T00:00:00.000Z",
        _status: "published",
      });
    });

    test("オーバーライドで記事オブジェクトをカスタマイズできる", () => {
      const result = createMockPost({
        id: 2,
        title: "Custom Title",
        slug: "custom-slug",
      });

      expect(result).toEqual({
        id: 2,
        title: "Custom Title",
        slug: "custom-slug",
        content: createLexicalContent("Test content"),
        author: 1,
        updatedAt: "2024-01-15T00:00:00.000Z",
        createdAt: "2024-01-15T00:00:00.000Z",
        publishedDate: "2024-01-15T00:00:00.000Z",
        _status: "published",
      });
    });
  });

  describe("createMockDraftPost", () => {
    test("ドラフト記事を作成し、publishedDateがundefinedになる", () => {
      const result = createMockDraftPost();

      expect(result).toEqual({
        id: 1,
        title: "Draft Post",
        slug: "draft-post",
        content: createLexicalContent("Test content"),
        author: 1,
        updatedAt: "2024-01-15T00:00:00.000Z",
        createdAt: "2024-01-15T00:00:00.000Z",
        publishedDate: undefined, // この行が未カバーだった
        _status: "draft",
      });
      // publishedDate が実際に undefined であることを明示的に確認
      expect(result.publishedDate).toBeUndefined();
    });

    test("オーバーライドでドラフト記事をカスタマイズできる", () => {
      const result = createMockDraftPost({
        id: 3,
        title: "Custom Draft",
      });

      expect(result).toEqual({
        id: 3,
        title: "Custom Draft",
        slug: "draft-post",
        content: createLexicalContent("Test content"),
        author: 1,
        updatedAt: "2024-01-15T00:00:00.000Z",
        createdAt: "2024-01-15T00:00:00.000Z",
        publishedDate: undefined,
        _status: "draft",
      });
      expect(result.publishedDate).toBeUndefined();
    });

    test("publishedDateのオーバーライドが可能", () => {
      const result = createMockDraftPost({
        publishedDate: "2024-01-20T00:00:00.000Z",
      });

      expect(result.publishedDate).toBe("2024-01-20T00:00:00.000Z");
      expect(result._status).toBe("draft");
    });
  });

  describe("createMockPosts", () => {
    test("指定した数の記事配列を作成する", () => {
      const result = createMockPosts(3);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 1,
        title: "Post 1",
        slug: "post-1",
        content: createLexicalContent("Content for post 1"),
        author: 1,
        updatedAt: "2024-01-15T00:00:00.000Z",
        createdAt: "2024-01-15T00:00:00.000Z",
        publishedDate: "2024-01-15T00:00:00.000Z",
        _status: "published",
      });
      expect(result[1]).toEqual({
        id: 2,
        title: "Post 2",
        slug: "post-2",
        content: createLexicalContent("Content for post 2"),
        author: 1,
        updatedAt: "2024-01-15T00:00:00.000Z",
        createdAt: "2024-01-15T00:00:00.000Z",
        publishedDate: "2024-01-15T00:00:00.000Z",
        _status: "published",
      });
      expect(result[2]).toEqual({
        id: 3,
        title: "Post 3",
        slug: "post-3",
        content: createLexicalContent("Content for post 3"),
        author: 1,
        updatedAt: "2024-01-15T00:00:00.000Z",
        createdAt: "2024-01-15T00:00:00.000Z",
        publishedDate: "2024-01-15T00:00:00.000Z",
        _status: "published",
      });
    });

    test("1つの記事を作成する", () => {
      const result = createMockPosts(1);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].title).toBe("Post 1");
    });

    test("5つの記事を作成する", () => {
      const result = createMockPosts(5);

      expect(result).toHaveLength(5);
      expect(result[4].id).toBe(5);
      expect(result[4].title).toBe("Post 5");
      expect(result[4].slug).toBe("post-5");
    });

    test("0を指定すると空の配列を返す", () => {
      const result = createMockPosts(0);

      expect(result).toEqual([]);
    });
  });

  describe("createMockPayloadResponse", () => {
    test("ドキュメント配列からPayloadレスポンスを作成する", () => {
      const docs = [
        { id: 1, title: "Post 1" },
        { id: 2, title: "Post 2" },
      ];

      const result = createMockPayloadResponse(docs, 1, 10);

      expect(result).toEqual({
        docs,
        totalDocs: 2,
        totalPages: 1,
        page: 1,
        limit: 10,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
        pagingCounter: 1,
      });
    });

    test("複数ページの場合のレスポンスを作成する", () => {
      const docs = [
        { id: 1, title: "Post 1" },
        { id: 2, title: "Post 2" },
      ];

      const result = createMockPayloadResponse(docs, 2, 1);

      expect(result).toEqual({
        docs,
        totalDocs: 2,
        totalPages: 2,
        page: 2,
        limit: 1,
        hasPrevPage: true,
        hasNextPage: false,
        prevPage: 1,
        nextPage: null,
        pagingCounter: 2,
      });
    });
  });

  describe("createEmptyPayloadResponse", () => {
    test("空のPayloadレスポンスを作成する", () => {
      const result = createEmptyPayloadResponse();

      expect(result).toEqual({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
        pagingCounter: 1,
      });
    });
  });

  describe("Special mock posts", () => {
    test("mockPostWithSpecialChars が特殊文字を含む記事を作成する", () => {
      expect(mockPostWithSpecialChars.title).toBe("Post with <script>alert('xss')</script>");
      expect(mockPostWithSpecialChars.slug).toBe("post-with-special-chars");
    });

    test("mockPostWithLongContent が長いコンテンツを持つ記事を作成する", () => {
      expect(mockPostWithLongContent.title).toBe("Post with very long content");
      expect(mockPostWithLongContent.slug).toBe("post-with-long-content");
      expect(
        (mockPostWithLongContent.content.root.children[0] as any).children[0].text,
      ).toHaveLength(10000);
    });

    test("mockPostWithEmptyContent が空のコンテンツを持つ記事を作成する", () => {
      expect(mockPostWithEmptyContent.title).toBe("Post with empty content");
      expect(mockPostWithEmptyContent.slug).toBe("post-with-empty-content");
      expect(mockPostWithEmptyContent.content.root.children).toEqual([]);
    });
  });
});
