/**
 * 統合テスト用のデータクリーンアップヘルパー
 */

import configPromise from "@payload-config";
import { getPayload, type Where } from "payload";

/**
 * データベースの全データをクリーンアップする
 */
export async function cleanupAllData() {
  const payload = await getPayload({ config: configPromise });

  try {
    // Postsコレクションをクリーンアップ
    await payload.delete({
      collection: "posts",
      where: {},
    });

    // Usersコレクション（admin以外）をクリーンアップ
    const users = await payload.find({
      collection: "users",
      where: {
        email: {
          not_equals: "admin@test.com", // 管理者ユーザーは保持
        },
      },
    });

    for (const user of users.docs) {
      await payload.delete({
        collection: "users",
        id: user.id,
      });
    }

    // Mediaコレクションをクリーンアップ
    await payload.delete({
      collection: "media",
      where: {},
    });
  } catch (error) {
    console.error("Error cleaning up test data:", error);
    throw error;
  }
}

/**
 * 特定のコレクションをクリーンアップする
 */
export async function cleanupCollection(
  collection: "posts" | "users" | "media",
  where: Where = {},
) {
  const payload = await getPayload({ config: configPromise });

  try {
    await payload.delete({
      collection,
      where,
    });
  } catch (error) {
    console.error(`Error cleaning up ${collection}:`, error);
    throw error;
  }
}

/**
 * テスト用データを作成する
 */
export async function createTestData() {
  const payload = await getPayload({ config: configPromise });

  try {
    // 必要に応じてテストデータを作成
    // 例: 管理者ユーザーが存在しない場合は作成
    const adminUsers = await payload.find({
      collection: "users",
      where: {
        email: {
          equals: "admin@test.com",
        },
      },
    });

    if (adminUsers.docs.length === 0) {
      await payload.create({
        collection: "users",
        data: {
          email: "admin@test.com",
          password: "test-password",
          role: "admin",
        },
      });
    }
  } catch (error) {
    console.error("Error creating test data:", error);
    throw error;
  }
}

/**
 * テストの前後で実行するセットアップとクリーンアップ
 */
export async function setupTestEnvironment() {
  await cleanupAllData();
  await createTestData();
}

export async function teardownTestEnvironment() {
  await cleanupAllData();
}
