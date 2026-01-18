import { vi } from "vitest";
import type { MediaRepository } from "@/domain/repositories/media-repository";
import type { PostRepository } from "@/domain/repositories/post-repository";
import type { UserRepository } from "@/domain/repositories/user-repository";

/**
 * テスト用のモックPostRepositoryを作成
 */
export function createMockPostRepository(): PostRepository {
  return {
    findBySlug: vi.fn(),
    findAll: vi.fn(),
    findPublishedSlugs: vi.fn(),
  };
}

/**
 * テスト用のモックMediaRepositoryを作成
 */
export function createMockMediaRepository(): MediaRepository {
  return {
    findById: vi.fn(),
    findAll: vi.fn(),
  };
}

/**
 * テスト用のモックUserRepositoryを作成
 */
export function createMockUserRepository(): UserRepository {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findAll: vi.fn(),
  };
}
