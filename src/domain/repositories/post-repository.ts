import type { FetchResult } from "@/lib/types";
import type { Post } from "@/payload-types";

/**
 * 記事リポジトリのインターフェース
 * ドメイン層が必要とするデータアクセス操作を定義
 */
export type PostRepository = {
  /**
   * slugから記事を取得
   */
  findBySlug(
    slug: string,
    options?: { draft?: boolean; overrideAccess?: boolean },
  ): Promise<FetchResult<Post>>;

  /**
   * 記事一覧を取得（ページネーション対応）
   */
  findAll(
    page: number,
    limit: number,
    options?: { draft?: boolean; overrideAccess?: boolean },
  ): Promise<
    FetchResult<{
      posts: Post[];
      totalPages: number;
      totalDocs: number;
    }>
  >;

  /**
   * 公開記事のスラッグ一覧を取得
   */
  findPublishedSlugs(): Promise<FetchResult<Array<{ slug: string }>>>;
};
