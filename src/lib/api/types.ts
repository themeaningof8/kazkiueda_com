import type { Where } from "payload";
import type { PayloadFindResult } from "@/lib/types";
import type { Media, Post, User } from "@/payload-types";

/**
 * Payload検索オプションの型定義
 */
export type PayloadFindOptions<T extends "posts" | "media" | "users"> = {
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
  populate?: Record<string, boolean>;
};

/**
 * コレクション名からデータ型へのマッピング
 */
export type CollectionDataType = {
  posts: Post;
  media: Media;
  users: User;
};

/**
 * Payload APIクライアントの型定義
 * 現在の payload-client.ts の関数をオブジェクトメソッドとして表現
 */
export type PayloadClient = {
  /**
   * 汎用検索関数（リトライ機能付き）
   */
  findPayload<T extends "posts" | "media" | "users">(
    options: PayloadFindOptions<T>,
  ): Promise<PayloadFindResult<CollectionDataType[T]>>;

  /**
   * 記事をslugで検索
   */
  findPostBySlug(
    slug: string,
    options?: { draft?: boolean; overrideAccess?: boolean },
  ): Promise<PayloadFindResult<Post>>;

  /**
   * 記事一覧を取得（ページネーション対応）
   */
  findPosts(options?: {
    page?: number;
    limit?: number;
    draft?: boolean;
    overrideAccess?: boolean;
  }): Promise<PayloadFindResult<Post>>;

  /**
   * 公開記事のスラッグ一覧を取得（SSG用）
   */
  findPublishedPostSlugs(): Promise<Array<{ slug: string }>>;
};
