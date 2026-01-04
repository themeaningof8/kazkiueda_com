import { cache } from "react";
import type { Post } from "@/payload-types";
import {
  findPostBySlug as findPostBySlugPayload,
  findPosts as findPostsPayload,
  findPublishedPostSlugs as findPublishedPostSlugsPayload,
} from "./api/payload-client";
import { BLOG_CONFIG } from "./constants";
import type { FetchResult } from "./types";

/**
 * キャッシュ戦略:
 * - React cache() を使用してリクエスト内の重複呼び出しを防ぐ
 * - ISR (revalidate = 3600) と組み合わせて1時間のキャッシュを実現
 * - キャッシュキーは関数引数に基づいて自動生成される
 */

type FetchOptions = {
  draft?: boolean;
  overrideAccess?: boolean;
};

/**
 * slugから記事を取得する
 * - draftMode有効時は drafts + overrideAccess を付与
 * - 非draftModeは `_status: published` で絞る
 *
 * Server Componentから使用する場合はこの関数を使用してください。
 * Client Componentから使用する場合は getPostBySlugAction を使用してください。
 */
export const getPostBySlug = cache(
  async (
    slug: string,
    { draft = false, overrideAccess = false }: FetchOptions = {},
  ): Promise<FetchResult<Post>> => {
    try {
      const result = await findPostBySlugPayload(slug, {
        draft,
        overrideAccess,
      });

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
);

/**
 * 記事一覧を取得する（ページネーション対応）
 * - draftMode有効時は drafts + overrideAccess で最新を取得
 * - 非draftModeは `_status: published` で絞る
 *
 * Server Componentから使用する場合はこの関数を使用してください。
 * Client Componentから使用する場合は getPostsAction を使用してください。
 */
export const getPosts = cache(
  async (
    page = 1,
    limit: number = BLOG_CONFIG.POSTS_PER_PAGE,
    { draft = false, overrideAccess = false }: FetchOptions = {},
  ): Promise<
    FetchResult<{
      posts: Post[];
      totalPages: number;
      totalDocs: number;
    }>
  > => {
    try {
      const result = await findPostsPayload({
        page,
        limit,
        draft,
        overrideAccess,
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
);

/**
 * 公開記事のスラッグ一覧を取得する（SSG用）
 *
 * ページネーションを使用して全件取得する。
 * 1000件超の記事があっても漏れなく取得できる。
 *
 * Server Componentから使用する場合はこの関数を使用してください。
 * Client Componentから使用する場合は getPublishedPostSlugsAction を使用してください。
 */
export const getPublishedPostSlugs = cache(
  async (): Promise<FetchResult<Array<{ slug: string }>>> => {
    try {
      const slugs = await findPublishedPostSlugsPayload();
      return { success: true, data: slugs };
    } catch (_error) {
      // APIレベルでエラーハンドリングされているはずだが、
      // 万一のエラー発生時にUNKNOWNエラーを返す
      return { success: false, error: "UNKNOWN" };
    }
  },
);
