import type { CollectionSlug, Payload } from "payload";
import type { User } from "@/payload-types";
import { createTestUser } from "./factories";

/**
 * 管理者ユーザーを作成
 */
export async function createAdminUser(payload: Payload): Promise<User> {
  const user = await createTestUser(payload, {
    email: `admin-${Date.now()}@test.com`,
    password: "test1234",
    role: "admin",
  });
  return user;
}

/**
 * 一般ユーザーを作成
 */
export async function createRegularUser(payload: Payload): Promise<User> {
  const user = await createTestUser(payload, {
    email: `user-${Date.now()}@test.com`,
    password: "test1234",
    role: "user",
  });
  return user;
}

/**
 * 未認証でPayload操作を実行するヘルパー
 * @example
 * const posts = await findAsUnauthenticated(payload, 'posts', {});
 */
export async function findAsUnauthenticated<_T>(
  payload: Payload,
  collection: CollectionSlug,
  options: Record<string, unknown> = {},
) {
  return await payload.find({
    collection,
    overrideAccess: false, // アクセス制御を有効化
    // userパラメータなし = 未認証
    ...options,
  });
}

/**
 * 認証ユーザーとしてPayload操作を実行するヘルパー
 */
export async function findAsUser<_T>(
  payload: Payload,
  user: User,
  collection: CollectionSlug,
  options: Record<string, unknown> = {},
) {
  return await payload.find({
    collection,
    user, // 認証ユーザーを指定
    overrideAccess: false,
    // draftのデフォルト値を削除 - optionsで指定可能
    ...options,
  });
}
