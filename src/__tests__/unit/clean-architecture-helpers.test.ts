import { describe, expect, test, vi } from "vitest";
import {
  createMockMediaRepository,
  createMockUserRepository,
} from "@/__tests__/mocks/repositories";
import { resetPayloadClient } from "@/lib/api/create-payload-client";
import { getPostRepository, resetPostRepository } from "@/lib/posts";

vi.mock("@/lib/env", () => ({
  env: {
    NODE_ENV: "test",
    PAYLOAD_SECRET: "test-secret-key-that-is-long-enough-for-validation-32-chars",
    DATABASE_URL: "postgresql://user:password@localhost:5432/testdb",
  },
  isProduction: false,
  isDevelopment: false,
}));

/**
 * Clean Architecture拡張用のヘルパー関数のテスト
 *
 * これらの関数は現在未使用だが、Clean Architectureの完全な実装に向けて
 * 拡張性を確保するために保持している。
 * 将来的にMedia/Userリポジトリのテストで使用されることを想定。
 */
describe("Clean Architecture Helpers", () => {
  test("createMockMediaRepository returns proper interface", () => {
    const mock = createMockMediaRepository();

    // MediaRepository interfaceのメソッドが存在することを確認
    expect(typeof mock.findById).toBe("function");
    expect(typeof mock.findAll).toBe("function");

    // デフォルトではvi.fn()が返されることを確認
    expect(vi.isMockFunction(mock.findById)).toBe(true);
    expect(vi.isMockFunction(mock.findAll)).toBe(true);
  });

  test("createMockUserRepository returns proper interface", () => {
    const mock = createMockUserRepository();

    // UserRepository interfaceのメソッドが存在することを確認
    expect(typeof mock.findById).toBe("function");
    expect(typeof mock.findByEmail).toBe("function");
    expect(typeof mock.findAll).toBe("function");

    // デフォルトではvi.fn()が返されることを確認
    expect(vi.isMockFunction(mock.findById)).toBe(true);
    expect(vi.isMockFunction(mock.findByEmail)).toBe(true);
    expect(vi.isMockFunction(mock.findAll)).toBe(true);
  });

  test("resetPayloadClient can be called without error", () => {
    // この関数は副作用を持つため、エラーが発生しないことを確認
    expect(() => resetPayloadClient()).not.toThrow();
  });

  test("getPostRepository returns a repository instance", () => {
    const repo = getPostRepository();

    // Repository interfaceのメソッドが存在することを確認
    expect(typeof repo.findBySlug).toBe("function");
    expect(typeof repo.findAll).toBe("function");
    expect(typeof repo.findPublishedSlugs).toBe("function");
  });

  test("resetPostRepository can be called without error", () => {
    // この関数は副作用を持つため、エラーが発生しないことを確認
    expect(() => resetPostRepository()).not.toThrow();
  });
});
