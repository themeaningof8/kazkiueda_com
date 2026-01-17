/**
 * Post Repository Interface
 *
 * 記事のデータアクセスを抽象化
 * インフラ層で実装される
 */

import type { Post } from "../entities/post.entity";
import type { Pagination } from "../value-objects/pagination.vo";
import type { PostStatus } from "../value-objects/post-status.vo";
import type { Slug } from "../value-objects/slug.vo";

export interface FindPostsOptions {
  page?: number;
  limit?: number;
  status?: PostStatus;
  tag?: string;
}

export interface FindPostsResult {
  posts: Post[];
  pagination: Pagination;
}

/**
 * PostRepository インターフェース
 */
export interface PostRepository {
  /**
   * IDで記事を取得
   */
  findById(id: number): Promise<Post | undefined>;

  /**
   * Slugで記事を取得
   */
  findBySlug(slug: Slug): Promise<Post | undefined>;

  /**
   * 記事一覧を取得（ページネーション対応）
   */
  findAll(options?: FindPostsOptions): Promise<FindPostsResult>;

  /**
   * タグで記事を検索
   */
  findByTag(tag: string, options?: FindPostsOptions): Promise<FindPostsResult>;

  /**
   * すべてのタグを取得
   */
  findAllTags(): Promise<string[]>;

  /**
   * 公開済み記事のスラグ一覧を取得
   */
  findPublishedSlugs(): Promise<Slug[]>;

  /**
   * 記事を保存（新規作成または更新）
   */
  save(post: Post): Promise<Post>;

  /**
   * 記事を削除
   */
  delete(id: number): Promise<void>;

  /**
   * 総件数を取得
   */
  count(options?: { status?: PostStatus; tag?: string }): Promise<number>;
}
