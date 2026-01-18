import { vi } from "vitest";
import type { PayloadFindResult } from "@/lib/types";

/**
 * PayloadClient関数のモック型定義
 */
export type MockPayloadClientFunctions = {
  findPayload: ReturnType<typeof vi.fn>;
  findPostBySlug: ReturnType<typeof vi.fn>;
  findPosts: ReturnType<typeof vi.fn>;
  findPublishedPostSlugs: ReturnType<typeof vi.fn>;
};

/**
 * PayloadClientのモックを作成
 *
 * @example
 * ```ts
 * const mockClient = createMockPayloadClient();
 *
 * vi.mocked(mockClient.findPostBySlug).mockResolvedValue({
 *   docs: [createMockPost()],
 *   totalDocs: 1,
 * });
 * ```
 */
export function createMockPayloadClient(): MockPayloadClientFunctions {
  return {
    findPayload: vi.fn(),
    findPostBySlug: vi.fn(),
    findPosts: vi.fn(),
    findPublishedPostSlugs: vi.fn(),
  };
}

/**
 * 空のPayloadレスポンスを作成（エラーケース用）
 */
export function createEmptyPayloadResponse<T>(): PayloadFindResult<T> {
  return {
    docs: [],
    totalDocs: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };
}

/**
 * PayloadFindResultを作成するヘルパー
 *
 * @example
 * ```ts
 * const response = createPayloadFindResult([post1, post2], { totalPages: 1 });
 * ```
 */
export function createPayloadFindResult<T>(
  docs: T[],
  options: {
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  } = {},
): PayloadFindResult<T> {
  return {
    docs,
    totalDocs: docs.length,
    totalPages: options.totalPages ?? 1,
    hasNextPage: options.hasNextPage ?? false,
    hasPrevPage: options.hasPrevPage ?? false,
  };
}
