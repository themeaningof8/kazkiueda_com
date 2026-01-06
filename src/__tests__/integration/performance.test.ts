import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { findPublishedPostSlugs } from "@/lib/api/payload-client";
import { getPosts } from "@/lib/posts";
import { createTestDbPool, destroyTestDbPool, truncateAllTables } from "@/test/db";
import { createBulkTestPosts, createTestUser } from "@/test/helpers/factories";
import { destroyTestPayload, getTestPayload } from "@/test/payload";
import { TEST_ENVIRONMENT } from "../../lib/performance/config";

describe.skipIf(!TEST_ENVIRONMENT.isCI)("Performance Tests", () => {
  const pool = createTestDbPool();
  const payloadKey = "performance.test";

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

  // CI環境では軽量テストのみ実行（100件）
  describe("Lightweight Performance Tests (CI Compatible)", () => {
    test.skipIf(!TEST_ENVIRONMENT.isCI)(
      "should complete findPublishedPostSlugs within 1000ms for 100 posts",
      async () => {
        const payload = await getTestPayload(payloadKey);
        const user = await createTestUser(payload);

        // 100件の記事を作成
        await createBulkTestPosts(payload, user.id, 100, {
          status: "published",
        });

        const start = Date.now();
        const result = await findPublishedPostSlugs();
        const duration = Date.now() - start;

        expect(result).toHaveLength(100);
        // CI環境では通常よりも遅いため、閾値を緩和（1000ms以内）
        expect(duration).toBeLessThan(1000);
      },
    );

    test.skipIf(!TEST_ENVIRONMENT.isCI)(
      "should complete getPosts pagination within 1000ms for 100 posts",
      async () => {
        const payload = await getTestPayload(payloadKey);
        const user = await createTestUser(payload);

        // 100件の記事を作成
        await createBulkTestPosts(payload, user.id, 100, {
          status: "published",
        });

        const start = Date.now();
        const result = await getPosts(1, 10); // 1ページ目、10件
        const duration = Date.now() - start;

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.posts).toHaveLength(10);
          expect(result.data.totalDocs).toBe(100);
        }
        // CI環境では通常よりも遅いため、閾値を緩和（1000ms以内）
        expect(duration).toBeLessThan(1000);
      },
    );
  });

  // CI環境ではスキップする重いテスト
  describe.skipIf(process.env.CI || !TEST_ENVIRONMENT.isCI)(
    "Heavy Performance Tests (Local Only)",
    () => {
      test("should handle 1000 posts efficiently", async () => {
        const payload = await getTestPayload(payloadKey);
        const user = await createTestUser(payload);

        // 1000件の記事を作成（BATCH_SIZE=50で20バッチ）
        const startCreate = Date.now();
        const posts = await createBulkTestPosts(payload, user.id, 1000, {
          status: "published",
        });
        const createDuration = Date.now() - startCreate;

        expect(posts).toHaveLength(1000);
        expect(createDuration).toBeLessThan(10000); // 作成は10秒以内

        // findPublishedPostSlugsのパフォーマンス
        const startSlugs = Date.now();
        const slugsResult = await findPublishedPostSlugs();
        const slugsDuration = Date.now() - startSlugs;

        expect(slugsResult).toHaveLength(1000);
        expect(slugsDuration).toBeLessThan(2000); // 2秒以内

        // getPostsのパフォーマンス（ページネーション）
        const startPosts = Date.now();
        const postsResult = await getPosts(1, 50); // 1ページ目、50件
        const postsDuration = Date.now() - startPosts;

        expect(postsResult.success).toBe(true);
        if (postsResult.success) {
          expect(postsResult.data.posts).toHaveLength(50);
          expect(postsResult.data.totalDocs).toBe(1000);
        }
        expect(postsDuration).toBeLessThan(1000); // 1秒以内
      });

      test("should maintain performance with mixed published/draft posts", async () => {
        const payload = await getTestPayload(payloadKey);
        const user = await createTestUser(payload);

        // 500件の公開記事 + 500件の下書き記事を作成
        await createBulkTestPosts(payload, user.id, 500, {
          title: "Published Post",
          status: "published",
        });
        await createBulkTestPosts(payload, user.id, 500, {
          title: "Draft Post",
          status: "draft",
        });

        // 公開記事のみを取得
        const start = Date.now();
        const result = await findPublishedPostSlugs();
        const duration = Date.now() - start;

        expect(result).toHaveLength(500); // 公開記事のみ
        expect(duration).toBeLessThan(1500); // 1.5秒以内
      });
    },
  );
});
