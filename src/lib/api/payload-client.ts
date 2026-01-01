import config from "@payload-config";
import { getPayload, type Where } from "payload";
import { BLOG_CONFIG } from "@/lib/constants";
import type { ErrorType, PayloadFindResult } from "@/lib/types";
import type { Media, Post, User } from "@/payload-types";
import { buildPublishStatusFilter, buildSlugFilter } from "./payload-filters";

/**
 * エラーを分類して適切なErrorTypeを返す
 */
function classifyError(error: unknown): ErrorType {
  if (error instanceof Error) {
    // ネットワーク関連のエラー
    if (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("ECONNREFUSED")
    ) {
      return "NETWORK_ERROR";
    }

    // タイムアウトエラー
    if (error.message.includes("timeout") || error.message.includes("TIMEOUT")) {
      return "TIMEOUT";
    }

    // CORSエラー
    if (
      error.message.includes("CORS") ||
      error.message.includes("Access-Control") ||
      error.message.includes("cross-origin") ||
      error.message.includes("preflight")
    ) {
      return "CORS_ERROR";
    }

    // データベース関連のエラー
    if (
      error.message.includes("database") ||
      error.message.includes("connection") ||
      error.message.includes("SQLITE_")
    ) {
      return "DB_ERROR";
    }

    // Payload固有のエラー
    if (error.message.includes("Payload") || error.message.includes("collection")) {
      return "DB_ERROR";
    }
  }

  // 不明なエラー
  return "UNKNOWN";
}

type PayloadFindOptions<T extends "posts" | "media" | "users"> = {
  collection: T;
  where?: Where;
  limit?: number;
  page?: number;
  sort?: string;
  draft?: boolean;
  overrideAccess?: boolean;
  select?: {
    slug?: boolean;
  };
};

type CollectionDataType = {
  posts: Post;
  media: Media;
  users: User;
};

/**
 * Payload APIのラッパー（リトライ機能付き）
 */
async function findPayload<T extends "posts" | "media" | "users">(
  options: PayloadFindOptions<T>,
): Promise<PayloadFindResult<CollectionDataType[T]>> {
  const maxRetries = 2;
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const payload = await getPayload({ config });

      const result = await payload.find({
        collection: options.collection,
        where: options.where,
        limit: options.limit,
        page: options.page,
        sort: options.sort,
        draft: options.draft,
        overrideAccess: options.overrideAccess,
        select: options.select,
      });

      // PaginatedDocs を PayloadFindResult に変換
      return {
        docs: result.docs,
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      };
    } catch (error) {
      lastError = error;

      // リトライ可能なエラーの場合のみリトライ
      const errorType = classifyError(error);
      const isRetryableError = ["NETWORK_ERROR", "TIMEOUT"].includes(errorType);

      if (!isRetryableError || attempt === maxRetries) {
        // リトライ不可または最大リトライ回数に達した場合はエラーをthrow
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        throw new Error(`${errorType}:${errorMessage}`);
      }

      // リトライ前に少し待機（指数バックオフ）
      await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 100));
    }
  }

  // ここには到達しないはずだが、念のため
  throw lastError;
}

/**
 * 記事をslugで検索
 */
export async function findPostBySlug(
  slug: string,
  options: { draft?: boolean; overrideAccess?: boolean } = {},
): Promise<PayloadFindResult<Post>> {
  try {
    const where = buildSlugFilter(slug, options.draft ?? false);

    return await findPayload<"posts">({
      collection: "posts",
      where,
      limit: 1,
      draft: options.draft,
      overrideAccess: options.overrideAccess,
    });
  } catch (_error) {
    // エラーが発生したら空の結果を返す
    // 上位の関数で適切なFetchResultに変換される
    return {
      docs: [],
      totalDocs: 0,
    };
  }
}

/**
 * 記事一覧を取得（ページネーション対応）
 */
export async function findPosts(
  options: { page?: number; limit?: number; draft?: boolean; overrideAccess?: boolean } = {},
): Promise<PayloadFindResult<Post>> {
  try {
    const where = buildPublishStatusFilter(options.draft ?? false);

    return await findPayload<"posts">({
      collection: "posts",
      where,
      sort: "-publishedDate",
      limit: options.limit,
      page: options.page,
      draft: options.draft,
      overrideAccess: options.overrideAccess,
    });
  } catch (_error) {
    // エラーが発生したら空の結果を返す
    // 上位の関数で適切なFetchResultに変換される
    return {
      docs: [],
      totalDocs: 0,
      totalPages: 0,
    };
  }
}

/**
 * 公開記事のスラッグ一覧を取得（SSG用）
 */
export async function findPublishedPostSlugs(): Promise<Array<{ slug: string }>> {
  try {
    const allSlugs: { slug: string }[] = [];
    let currentPage = 1;
    let hasMore = true;
    const pageSize = BLOG_CONFIG.PAGINATION_PAGE_SIZE_SSG;

    while (hasMore) {
      const result = await findPayload<"posts">({
        collection: "posts",
        where: { _status: { equals: "published" } },
        limit: pageSize,
        page: currentPage,
        select: { slug: true },
      });

      const slugs = result.docs.map((post) => ({
        slug: post.slug ?? "",
      }));

      allSlugs.push(...slugs.filter((s) => s.slug));
      hasMore = result.hasNextPage ?? false;
      currentPage++;
    }

    return allSlugs;
  } catch (_error) {
    // エラーが発生したら空の配列を返す
    return [];
  }
}
