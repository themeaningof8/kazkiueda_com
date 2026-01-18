/**
 * DI Container Configuration
 *
 * Awilixを使用した依存性注入コンテナの設定
 * リポジトリとユースケースを登録し、アプリケーション全体で利用可能にする
 */

import { type AwilixContainer, asClass, createContainer } from "awilix";
import { GetAllPostsUseCase } from "@/application/use-cases/get-all-posts.use-case";
// Application Layer - Use Cases
import { GetPostBySlugUseCase } from "@/application/use-cases/get-post-by-slug.use-case";
import { GetPublishedPostSlugsUseCase } from "@/application/use-cases/get-published-post-slugs.use-case";
import { PayloadMediaRepository } from "@/infrastructure/persistence/payload/repositories/payload-media.repository";
// Infrastructure Layer - Repository Implementations
import { PayloadPostRepository } from "@/infrastructure/persistence/payload/repositories/payload-post.repository";
import { PayloadUserRepository } from "@/infrastructure/persistence/payload/repositories/payload-user.repository";
import type { AppContainer } from "./types";

/**
 * グローバルDIコンテナインスタンス
 *
 * Next.js App Routerのサーバーコンポーネント環境では、
 * モジュールレベルでコンテナをシングルトンとして保持
 */
let container: AwilixContainer<AppContainer> | null = null;

/**
 * DIコンテナを作成・初期化する
 *
 * @returns 設定済みのAwilixコンテナ
 */
function createAppContainer(): AwilixContainer<AppContainer> {
  const newContainer = createContainer<AppContainer>({
    injectionMode: "CLASSIC",
  });

  // Repositories の登録
  // SINGLETON: ステートレスなので、アプリケーション全体で1つのインスタンスを共有
  newContainer.register({
    postRepository: asClass(PayloadPostRepository).singleton(),
    userRepository: asClass(PayloadUserRepository).singleton(),
    mediaRepository: asClass(PayloadMediaRepository).singleton(),
  });

  // Use Cases の登録
  // SCOPED: 各リクエストごとに新しいインスタンスを作成（現在はSINGLETONとして実装）
  // ステートレスなので実質SINGLETONでも問題ないが、将来的な拡張性のためSCOPEDも検討可能
  newContainer.register({
    getPostBySlugUseCase: asClass(GetPostBySlugUseCase).singleton(),
    getAllPostsUseCase: asClass(GetAllPostsUseCase).singleton(),
    getPublishedPostSlugsUseCase: asClass(GetPublishedPostSlugsUseCase).singleton(),
  });

  return newContainer;
}

/**
 * DIコンテナのインスタンスを取得する
 *
 * 初回呼び出し時にコンテナを作成し、以降は同じインスタンスを返す
 * Next.jsのサーバーコンポーネントから安全に呼び出せる
 *
 * @returns DIコンテナインスタンス
 */
export function getContainer(): AwilixContainer<AppContainer> {
  if (!container) {
    container = createAppContainer();
  }
  return container;
}

/**
 * DIコンテナをリセットする（テスト用）
 *
 * @internal
 */
export function resetContainer(): void {
  if (container) {
    container.dispose();
    container = null;
  }
}
