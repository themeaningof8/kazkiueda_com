/**
 * テスト用のUser関連フィクスチャ
 */

import type { User } from "@/payload-types";

/**
 * 基本的なユーザーのフィクスチャ
 */
export const createMockUser = (overrides: Partial<User> = {}): Partial<User> => ({
  id: 1,
  email: "test@example.com",
  name: "Test User",
  role: "user",
  updatedAt: "2024-01-15T00:00:00.000Z",
  createdAt: "2024-01-15T00:00:00.000Z",
  ...overrides,
});

/**
 * 管理者ユーザーのフィクスチャ
 */
export const createMockAdminUser = (overrides: Partial<User> = {}): Partial<User> =>
  createMockUser({
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    ...overrides,
  });

/**
 * 複数のユーザーのフィクスチャ
 */
export const createMockUsers = (count: number): Partial<User>[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockUser({
      id: i + 1,
      email: `user${i + 1}@example.com`,
      name: `User ${i + 1}`,
    }),
  );
};
