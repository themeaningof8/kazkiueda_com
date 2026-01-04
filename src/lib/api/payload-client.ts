import config from "@payload-config";
import { getPayload, type Payload, type Where } from "payload";
import { BLOG_CONFIG } from "@/lib/constants";
import type { ErrorType, PayloadFindResult } from "@/lib/types";
import type { Media, Post, User } from "@/payload-types";
import { buildPublishStatusFilter, buildSlugFilter } from "./payload-filters";

// Payloadインスタンスのキャッシュ（プロセス内で一度だけ初期化）
let payloadInstance: Payload | null = null;

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

/**
 * Payloadインスタンスを取得（キャッシュされたものを使用）
 */
async function getPayloadInstance(): Promise<Payload> {
  if (!payloadInstance) {
    payloadInstance = await getPayload({ config });
  }
  return payloadInstance;
}

/**
 * テスト用：Payloadインスタンスのキャッシュをクリア
 */
export function clearPayloadCache(): void {
  payloadInstance = null;
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
  populate?: Record<string, boolean>; // リレーションシップのpopulate設定
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
      const payload = await getPayloadInstance();

      const result = await payload.find({
        collection: options.collection,
        where: options.where,
        limit: options.limit,
        page: options.page,
        sort: options.sort,
        draft: options.draft,
        overrideAccess: options.overrideAccess,
        select: options.select,
        populate: options.populate,
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
      populate: {
        featuredImage: true,
        author: true,
      },
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
      populate: {
        featuredImage: true,
        author: true,
      },
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
 * 並列処理でパフォーマンスを最適化
 */
export async function findPublishedPostSlugs(): Promise<Array<{ slug: string }>> {
  try {
    const pageSize = BLOG_CONFIG.PAGINATION_PAGE_SIZE_SSG;
    const maxConcurrentRequests = 5; // 同時実行数を制限してDB負荷をコントロール

    // 最初のページを取得して総件数を把握
    const firstResult = await findPayload<"posts">({
      collection: "posts",
      where: { _status: { equals: "published" } },
      limit: pageSize,
      page: 1,
      select: { slug: true },
    });

    const allSlugs: { slug: string }[] = [];
    const firstPageSlugs = firstResult.docs.map((post) => ({
      slug: post.slug ?? "",
    }));
    allSlugs.push(...firstPageSlugs.filter((s) => s.slug));

    const totalPages = firstResult.totalPages ?? 1;

    if (totalPages <= 1) {
      // 1ページのみの場合はそのまま返す
      return allSlugs;
    }

    // 残りのページを並列で取得
    const remainingPages = [];
    for (let page = 2; page <= totalPages; page++) {
      remainingPages.push(page);
    }

    // 同時実行数を制限しながら並列処理
    const pagePromises: Promise<{ slug: string }[]>[] = [];
    for (let i = 0; i < remainingPages.length; i += maxConcurrentRequests) {
      const batch = remainingPages.slice(i, i + maxConcurrentRequests);
      const batchPromises = batch.map(async (page) => {
        const result = await findPayload<"posts">({
          collection: "posts",
          where: { _status: { equals: "published" } },
          limit: pageSize,
          page,
          select: { slug: true },
        });

        return result.docs
          .map((post) => ({
            slug: post.slug ?? "",
          }))
          .filter((s) => s.slug);
      });

      pagePromises.push(...batchPromises);
    }

    // すべてのバッチが完了するのを待つ
    const batchResults = await Promise.all(pagePromises);

    // 結果を統合
    for (const slugs of batchResults) {
      allSlugs.push(...slugs);
    }

    return allSlugs;
  } catch (_error) {
    // エラーが発生したら空の配列を返す
    return [];
  }
}
