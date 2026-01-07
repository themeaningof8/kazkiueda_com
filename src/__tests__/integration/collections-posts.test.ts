import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { createTestDbPool, destroyTestDbPool, truncateAllTables } from "@/test/db";
import { findAsUnauthenticated } from "@/test/helpers/auth";
import { createTestPost, createTestUser } from "@/test/helpers/factories";
import { makeLexicalContent } from "@/test/helpers/lexical";
import { destroyTestPayload, getTestPayload } from "@/test/payload";

/**
 * Posts Collection の統合テスト（最小限の煙テスト）
 *
 * Testing Trophy の観点から、アクセス制御の詳細なテストは Payload CMS 自体の責任であり、
 * 私たちのテストでは以下の最小限の動作確認のみを行う:
 *
 * 1. 基本的な CRUD 操作が動作すること
 * 2. アクセス制御の設定が有効であること（代表的なケースのみ）
 * 3. カスタムフックが正しく動作すること
 *
 * 詳細なアクセス制御ロジックのテストは、以下の理由で削除:
 * - Payload CMS のフレームワーク機能のテスト
 * - 私たちのコードは宣言的な設定のみ
 * - Integration テストの実行コストが高い
 * - Unit テストでカバーできる部分が多い
 */
describe("collections/Posts.ts Integration Tests (Minimal Smoke Tests)", () => {
  const pool = createTestDbPool();
  const payloadKey = `collections-posts-${Date.now()}`;

  beforeAll(async () => {
    await truncateAllTables(pool);
    await getTestPayload(payloadKey);
  });

  afterEach(async () => {
    await truncateAllTables(pool);
  });

  afterAll(async () => {
    await destroyTestPayload(payloadKey);
    await destroyTestDbPool(pool);
  });

  describe("基本的な CRUD 操作", () => {
    test("認証ユーザーは記事を作成・更新・削除できる", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // Create
      const post = await payload.create({
        collection: "posts",
        data: {
          title: "Test Post",
          content: makeLexicalContent("Test content"),
          author: user.id,
        },
        user,
        overrideAccess: false,
      });

      expect(post.title).toBe("Test Post");

      // Update
      const updated = await payload.update({
        collection: "posts",
        id: post.id,
        data: { title: "Updated Title" },
        user,
        overrideAccess: false,
      });

      expect(updated.title).toBe("Updated Title");

      // Delete
      await payload.delete({
        collection: "posts",
        id: post.id,
        user,
        overrideAccess: false,
      });

      const result = await payload.find({
        collection: "posts",
        where: { id: { equals: post.id } },
        overrideAccess: true,
      });
      expect(result.docs).toHaveLength(0);
    });
  });

  describe("アクセス制御", () => {
    test("未認証ユーザーは公開記事のみ読める", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // 公開記事と下書き記事を作成
      await createTestPost(payload, user.id, {
        title: "Published Post",
        status: "published",
      });
      await createTestPost(payload, user.id, {
        title: "Draft Post",
        status: "draft",
      });

      // 未認証でfindを実行
      const result = await findAsUnauthenticated(payload, "posts");

      // 公開記事のみ返される
      expect(result.docs).toHaveLength(1);
      expect((result.docs[0] as unknown as Record<string, unknown>)._status).toBe("published");
    });

    test("未認証ユーザーは記事を作成できない", async () => {
      const payload = await getTestPayload(payloadKey);

      await expect(
        payload.create({
          collection: "posts",
          data: {
            title: "Test Post",
            content: makeLexicalContent("Test content"),
          },
          draft: true,
          overrideAccess: false,
        }),
      ).rejects.toThrow();
    });
  });

  describe("カスタムフック: slug 自動生成", () => {
    test("titleからslugが自動生成される", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      const post = await payload.create({
        collection: "posts",
        data: {
          title: "Test Post Title",
          content: makeLexicalContent("Test content"),
          author: user.id,
        },
        user,
        overrideAccess: false,
      });

      expect(post.slug).toBe("test-post-title");
    });

    test("既存slugは上書きされない", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      const post = await payload.create({
        collection: "posts",
        data: {
          title: "Test Post Title",
          slug: "custom-slug",
          content: makeLexicalContent("Test content"),
          author: user.id,
        },
        user,
        overrideAccess: false,
      });

      expect(post.slug).toBe("custom-slug");
    });
  });

  describe("カスタムフック: publishedDate 自動設定", () => {
    test("公開状態になったときに自動的に公開日が設定される", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      const post = await payload.create({
        collection: "posts",
        data: {
          title: "Published Post",
          content: makeLexicalContent("Test content"),
          author: user.id,
          _status: "published",
        },
        user,
        overrideAccess: false,
      });

      expect(post.publishedDate).toBeDefined();
      if (post.publishedDate) {
        expect(new Date(post.publishedDate).getTime()).toBeCloseTo(
          Date.now(),
          -4, // ミリ秒単位での誤差（5秒以内）を許容
        );
      }
    });

    test("publishedDateが既に設定されている場合、上書きしない", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);
      const customDate = new Date("2024-01-01").toISOString();

      const post = await payload.create({
        collection: "posts",
        data: {
          title: "Published Post",
          content: makeLexicalContent("Test content"),
          author: user.id,
          _status: "published",
          publishedDate: customDate,
        },
        user,
        overrideAccess: false,
      });

      expect(post.publishedDate).toBe(customDate);
    });
  });
});
