/**
 * テスト用のPost関連フィクスチャ
 */

import type { Post } from "@/payload-types";

/**
 * 基本的なLexicalコンテンツの構造
 */
export const createLexicalContent = (text = "") => ({
  root: {
    type: "root" as const,
    children: text
      ? [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text,
                format: 0,
                version: 1,
              },
            ],
            direction: null,
            format: "" as const,
            indent: 0,
            version: 1,
          },
        ]
      : [],
    direction: null,
    format: "" as const,
    indent: 0,
    version: 1,
  },
});

/**
 * 基本的な記事のフィクスチャ
 */
export const createMockPost = (overrides: Partial<Post> = {}): Post =>
  ({
    id: 1,
    title: "Test Post",
    slug: "test-post",
    content: createLexicalContent("Test content"),
    author: 1,
    updatedAt: "2024-01-15T00:00:00.000Z",
    createdAt: "2024-01-15T00:00:00.000Z",
    publishedDate: "2024-01-15T00:00:00.000Z",
    _status: "published",
    ...overrides,
  }) as Post;

/**
 * ドラフト記事のフィクスチャ
 */
export const createMockDraftPost = (overrides: Partial<Post> = {}): Post =>
  createMockPost({
    title: "Draft Post",
    slug: "draft-post",
    _status: "draft",
    publishedDate: undefined,
    ...overrides,
  });

/**
 * 複数の記事のフィクスチャ
 */
export const createMockPosts = (count: number): Post[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockPost({
      id: i + 1,
      title: `Post ${i + 1}`,
      slug: `post-${i + 1}`,
      content: createLexicalContent(`Content for post ${i + 1}`),
    }),
  );
};

/**
 * Payload API レスポンスのフィクスチャ
 */
export const createMockPayloadResponse = <T>(docs: T[], page = 1, limit = 10) => ({
  docs,
  totalDocs: docs.length,
  totalPages: Math.ceil(docs.length / limit),
  page,
  limit,
  hasPrevPage: page > 1,
  hasNextPage: page < Math.ceil(docs.length / limit),
  prevPage: page > 1 ? page - 1 : null,
  nextPage: page < Math.ceil(docs.length / limit) ? page + 1 : null,
  pagingCounter: (page - 1) * limit + 1,
});

/**
 * 空のPayload APIレスポンス
 */
export const createEmptyPayloadResponse = () => createMockPayloadResponse([], 1, 10);

/**
 * 特殊なケース用のフィクスチャ
 */
export const mockPostWithSpecialChars = createMockPost({
  title: "Post with <script>alert('xss')</script>",
  slug: "post-with-special-chars",
});

export const mockPostWithLongContent = createMockPost({
  title: "Post with very long content",
  slug: "post-with-long-content",
  content: createLexicalContent("A".repeat(10000)),
});

export const mockPostWithEmptyContent = createMockPost({
  title: "Post with empty content",
  slug: "post-with-empty-content",
  content: createLexicalContent(),
});
