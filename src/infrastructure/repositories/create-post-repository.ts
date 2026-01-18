import type { PostRepository } from "@/domain/repositories/post-repository";
import type { PayloadClient } from "@/lib/api/types";
import { BLOG_CONFIG } from "@/lib/constants";

/**
 * PostRepositoryファクトリー関数
 * PayloadClientに依存してPostRepositoryを実装
 *
 * @param payloadClient - 依存するPayloadClient
 * @returns PostRepository実装
 */
export function createPostRepository(payloadClient: PayloadClient): PostRepository {
  return {
    async findBySlug(slug, options = {}) {
      try {
        const result = await payloadClient.findPostBySlug(slug, options);
        const post = result.docs[0];

        if (!post) {
          return { success: false, error: "NOT_FOUND" };
        }

        return { success: true, data: post };
      } catch (_error) {
        // APIレベルでエラーハンドリングされているはずだが、
        // 万一のエラー発生時にUNKNOWNエラーを返す
        return { success: false, error: "UNKNOWN" };
      }
    },

    async findAll(page = 1, limit = BLOG_CONFIG.POSTS_PER_PAGE, options = {}) {
      try {
        const result = await payloadClient.findPosts({
          page,
          limit,
          ...options,
        });

        return {
          success: true,
          data: {
            posts: result.docs,
            totalPages: result.totalPages ?? 0,
            totalDocs: result.totalDocs,
          },
        };
      } catch (_error) {
        // APIレベルでエラーハンドリングされているはずだが、
        // 万一のエラー発生時にDB_ERRORを返す
        return { success: false, error: "DB_ERROR" };
      }
    },

    async findPublishedSlugs() {
      try {
        const slugs = await payloadClient.findPublishedPostSlugs();
        return { success: true, data: slugs };
      } catch (_error) {
        // APIレベルでエラーハンドリングされているはずだが、
        // 万一のエラー発生時にUNKNOWNエラーを返す
        return { success: false, error: "UNKNOWN" };
      }
    },
  };
}
