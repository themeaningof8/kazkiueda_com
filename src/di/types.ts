/**
 * DI Container Type Definitions
 *
 * Awilixコンテナに登録される全ての依存関係の型定義
 */

import type { GetAllPostsUseCase } from "@/application/use-cases/get-all-posts.use-case";
import type { GetPostBySlugUseCase } from "@/application/use-cases/get-post-by-slug.use-case";
import type { GetPublishedPostSlugsUseCase } from "@/application/use-cases/get-published-post-slugs.use-case";
import type { MediaRepository } from "@/domain/repositories/media.repository";
import type { PostRepository } from "@/domain/repositories/post.repository";
import type { UserRepository } from "@/domain/repositories/user.repository";

/**
 * DIコンテナのクレードル（依存関係の型定義）
 *
 * すべての登録された依存関係はここで型定義される
 * これにより、コンテナから取得する際に型安全性が保証される
 */
export interface AppContainer {
  // Repositories
  postRepository: PostRepository;
  userRepository: UserRepository;
  mediaRepository: MediaRepository;

  // Use Cases
  getPostBySlugUseCase: GetPostBySlugUseCase;
  getAllPostsUseCase: GetAllPostsUseCase;
  getPublishedPostSlugsUseCase: GetPublishedPostSlugsUseCase;
}
