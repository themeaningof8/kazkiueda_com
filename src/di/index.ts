/**
 * DI Container Public API
 *
 * DIコンテナへのアクセスを提供するパブリックAPI
 * サーバーコンポーネント、APIルート、Server Actionsから使用可能
 */

import { getContainer } from "./container";
import type { AppContainer } from "./types";

/**
 * ユースケースを取得するヘルパー関数
 *
 * Server Components や API Routes から簡単にユースケースにアクセスできる
 *
 * @example
 * ```ts
 * import { getUseCase } from "@/di";
 *
 * const useCase = getUseCase("getPostBySlugUseCase");
 * const result = await useCase.execute({ slug: "my-post" });
 * ```
 */
export function getUseCase<K extends keyof AppContainer>(name: K): AppContainer[K] {
  const container = getContainer();
  return container.resolve(name);
}

/**
 * リポジトリを取得するヘルパー関数
 *
 * 主にテストやユースケース外からの直接アクセスが必要な場合に使用
 * 通常はユースケース経由でアクセスすることを推奨
 *
 * @example
 * ```ts
 * import { getRepository } from "@/di";
 *
 * const postRepo = getRepository("postRepository");
 * const post = await postRepo.findById(1);
 * ```
 */
export function getRepository<K extends keyof AppContainer>(name: K): AppContainer[K] {
  const container = getContainer();
  return container.resolve(name);
}

/**
 * DIコンテナ全体を取得する
 *
 * 高度なユースケースや拡張が必要な場合に使用
 * 通常は getUseCase() や getRepository() を使用することを推奨
 */
export { getContainer } from "./container";

/**
 * 型定義をエクスポート
 */
export type { AppContainer } from "./types";
