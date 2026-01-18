import { cache } from "react";
import type { PostRepository } from "@/domain/repositories/post-repository";
import { createPostRepository } from "@/infrastructure/repositories/create-post-repository";
import type { Post } from "@/payload-types";
import { createPayloadClient } from "./api/create-payload-client";
import { BLOG_CONFIG } from "./constants";
import type { FetchResult } from "./types";

/**
 * キャッシュ戦略:
 * - React cache() を使用してリクエスト内の重複呼び出しを防ぐ
 * - ISR (revalidate = 3600) と組み合わせて1時間のキャッシュを実現
 * - キャッシュキーは関数引数に基づいて自動生成される
 */

// デフォルトのリポジトリインスタンスを作成
const defaultPayloadClient = createPayloadClient();
const defaultPostRepository = createPostRepository(defaultPayloadClient);

/**
 * 記事リポジトリインスタンス
 * テスト時はsetPostRepository()でカスタムリポジトリを注入可能
 */
let postRepositoryInstance: PostRepository = defaultPostRepository;

/**
 * テスト用：記事リポジトリを設定
 */
export function setPostRepository(repository: PostRepository): void {
  postRepositoryInstance = repository;
}

/**
 * テスト用：記事リポジトリを取得
 * @knipignore - Clean Architecture拡張用（将来的にテストで使用）
 */
export function getPostRepository(): PostRepository {
  return postRepositoryInstance;
}

/**
 * テスト用：記事リポジトリをデフォルトにリセット
 * テスト間の状態汚染を防ぐため、afterEachで呼び出すことを推奨
 * @knipignore - Clean Architecture拡張用（将来的にテストで使用）
 */
export function resetPostRepository(): void {
  postRepositoryInstance = defaultPostRepository;
}

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
    return postRepositoryInstance.findBySlug(slug, { draft, overrideAccess });
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
    return postRepositoryInstance.findAll(page, limit, { draft, overrideAccess });
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
    return postRepositoryInstance.findPublishedSlugs();
  },
);
