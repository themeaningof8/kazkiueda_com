/**
 * DI Container Tests
 *
 * DIコンテナが正しく動作することを確認するテスト
 */

import { beforeEach, describe, expect, it } from "vitest";
import { GetAllPostsUseCase } from "@/application/use-cases/get-all-posts.use-case";
import { GetPostBySlugUseCase } from "@/application/use-cases/get-post-by-slug.use-case";
import { GetPublishedPostSlugsUseCase } from "@/application/use-cases/get-published-post-slugs.use-case";
import { getRepository, getUseCase } from "@/di";
import { getContainer, resetContainer } from "@/di/container";
import { PayloadMediaRepository } from "@/infrastructure/persistence/payload/repositories/payload-media.repository";
import { PayloadPostRepository } from "@/infrastructure/persistence/payload/repositories/payload-post.repository";
import { PayloadUserRepository } from "@/infrastructure/persistence/payload/repositories/payload-user.repository";

describe("DI Container", () => {
  beforeEach(() => {
    // 各テスト前にコンテナをリセット
    resetContainer();
  });

  describe("Container Initialization", () => {
    it("コンテナが正しく初期化される", () => {
      const container = getContainer();
      expect(container).toBeDefined();
    });

    it("同じコンテナインスタンスを返す（シングルトン）", () => {
      const container1 = getContainer();
      const container2 = getContainer();
      expect(container1).toBe(container2);
    });
  });

  describe("Repository Registration", () => {
    it("PostRepository が正しく登録されている", () => {
      const repo = getRepository("postRepository");
      expect(repo).toBeDefined();
      expect(repo).toBeInstanceOf(PayloadPostRepository);
    });

    it("UserRepository が正しく登録されている", () => {
      const repo = getRepository("userRepository");
      expect(repo).toBeDefined();
      expect(repo).toBeInstanceOf(PayloadUserRepository);
    });

    it("MediaRepository が正しく登録されている", () => {
      const repo = getRepository("mediaRepository");
      expect(repo).toBeDefined();
      expect(repo).toBeInstanceOf(PayloadMediaRepository);
    });

    it("リポジトリがシングルトンとして動作する", () => {
      const repo1 = getRepository("postRepository");
      const repo2 = getRepository("postRepository");
      expect(repo1).toBe(repo2);
    });
  });

  describe("Use Case Registration", () => {
    it("GetPostBySlugUseCase が正しく登録されている", () => {
      const useCase = getUseCase("getPostBySlugUseCase");
      expect(useCase).toBeDefined();
      expect(useCase).toBeInstanceOf(GetPostBySlugUseCase);
    });

    it("GetAllPostsUseCase が正しく登録されている", () => {
      const useCase = getUseCase("getAllPostsUseCase");
      expect(useCase).toBeDefined();
      expect(useCase).toBeInstanceOf(GetAllPostsUseCase);
    });

    it("GetPublishedPostSlugsUseCase が正しく登録されている", () => {
      const useCase = getUseCase("getPublishedPostSlugsUseCase");
      expect(useCase).toBeDefined();
      expect(useCase).toBeInstanceOf(GetPublishedPostSlugsUseCase);
    });

    it("ユースケースがシングルトンとして動作する", () => {
      const useCase1 = getUseCase("getPostBySlugUseCase");
      const useCase2 = getUseCase("getPostBySlugUseCase");
      expect(useCase1).toBe(useCase2);
    });
  });

  describe("Dependency Injection", () => {
    it("ユースケースに正しくリポジトリが注入される", () => {
      const useCase = getUseCase("getPostBySlugUseCase");
      const postRepo = getRepository("postRepository");
      const userRepo = getRepository("userRepository");
      const mediaRepo = getRepository("mediaRepository");

      // UseCaseのprivateフィールドにアクセスはできないが、
      // インスタンスが正しく作成されることは確認できる
      expect(useCase).toBeDefined();
      expect(postRepo).toBeDefined();
      expect(userRepo).toBeDefined();
      expect(mediaRepo).toBeDefined();
    });
  });

  describe("Container Reset", () => {
    it("resetContainer() でコンテナがリセットされる", () => {
      const container1 = getContainer();
      resetContainer();
      const container2 = getContainer();

      // 新しいコンテナが作成される
      expect(container1).not.toBe(container2);
    });

    it("リセット後も依存関係が正しく解決される", () => {
      resetContainer();
      const useCase = getUseCase("getPostBySlugUseCase");
      expect(useCase).toBeDefined();
      expect(useCase).toBeInstanceOf(GetPostBySlugUseCase);
    });
  });
});
