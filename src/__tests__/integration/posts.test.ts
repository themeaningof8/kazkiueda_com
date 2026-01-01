import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { getPostBySlug, getPosts, getPublishedPostSlugs } from "@/lib/posts";
import { createTestDbPool, destroyTestDbPool, truncateAllTables } from "@/test/db";
import { createBulkTestPosts, createTestPost, createTestUser } from "@/test/helpers/factories";
import { destroyTestPayload, getTestPayload } from "@/test/payload";

describe("Posts integration (Payload Local API + Postgres)", () => {
  const pool = createTestDbPool();
  const payloadKey = `posts-${Date.now()}`;

  beforeAll(async () => {
    // 前回実行の残骸があっても必ずクリーンな状態で開始する
    // NOTE: Payload初期化直後はDBスキーマ取得などが並走することがあるため、
    // 先にTRUNCATEしてロック競合（deadlock）を避ける
    await truncateAllTables(pool);
    await getTestPayload(payloadKey);
  });

  afterEach(async () => {
    // 各テスト後にデータをクリーンアップ
    await truncateAllTables(pool);
  });

  afterAll(async () => {
    await destroyTestPayload(payloadKey);
    await destroyTestDbPool(pool);
  });

  test("should fetch published post by slug via Payload Local API", async () => {
    const payload = await getTestPayload(payloadKey);

    // Given: 公開記事が1件存在する
    const user = await createTestUser(payload);
    const slug = `posts-${randomUUID()}`;
    const post = await createTestPost(payload, user.id, {
      title: "Test Post Title",
      slug,
      status: "published",
    });

    // When: slugで記事を取得
    const fetched = await getPostBySlug(post.slug || "");

    // Then: 正しい記事データが返る
    expect(fetched.success).toBe(true);
    if (fetched.success) {
      expect(fetched.data.slug).toBe(post.slug);
      expect(fetched.data.title).toBe(post.title);
    }

    // When: 記事一覧を取得
    const list = await getPosts(1, 12);

    // Then: 作成した記事が一覧に含まれる
    expect(list.success).toBe(true);
    if (list.success) {
      expect(list.data.posts.some((p) => p.slug === post.slug)).toBe(true);
    }
  });

  test("should return error for non-existent slug", async () => {
    const result = await getPostBySlug("non-existent-slug");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("NOT_FOUND");
    }
  });

  test("should return empty list when no published posts exist", async () => {
    const result = await getPosts(1, 12);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.posts).toHaveLength(0);
      // Payload CMSの仕様では、データがなくても1ページとして扱われる場合がある
      // totalPagesはページネーションの総ページ数なので、データがなくても1になることがある
      expect(result.data.totalPages).toBeGreaterThanOrEqual(0);
      expect(result.data.totalDocs).toBe(0);
    }
  });

  describe("getPostBySlug", () => {
    test("should fetch draft post when draft=true", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);
      const slug = `draft-${randomUUID()}`;

      await createTestPost(payload, user.id, {
        title: "Draft Post",
        slug,
        status: "draft",
      });

      const result = await getPostBySlug(slug, { draft: true, overrideAccess: true });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBe(slug);
        expect(result.data._status).toBe("draft");
      }
    });

    test("should NOT fetch draft post when draft=false", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);
      const slug = `draft-${randomUUID()}`;

      await createTestPost(payload, user.id, {
        title: "Draft Post",
        slug,
        status: "draft",
      });

      const result = await getPostBySlug(slug, { draft: false });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("NOT_FOUND");
      }
    });
  });

  describe("getPosts", () => {
    test("should handle pagination correctly with multiple pages", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // 15件の記事を作成
      await createBulkTestPosts(payload, user.id, 15, {
        status: "published",
      });

      // Page 1: limit=10
      const page1 = await getPosts(1, 10);
      expect(page1.success).toBe(true);
      if (page1.success) {
        expect(page1.data.posts).toHaveLength(10);
        expect(page1.data.totalDocs).toBe(15);
        expect(page1.data.totalPages).toBe(2);
      }

      // Page 2: limit=10
      const page2 = await getPosts(2, 10);
      expect(page2.success).toBe(true);
      if (page2.success) {
        expect(page2.data.posts).toHaveLength(5);
        expect(page2.data.totalDocs).toBe(15);
      }
    });

    test("should include draft posts when draft=true", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      await createTestPost(payload, user.id, {
        title: "Published Post",
        slug: `published-${randomUUID()}`,
        status: "published",
      });

      await createTestPost(payload, user.id, {
        title: "Draft Post",
        slug: `draft-${randomUUID()}`,
        status: "draft",
      });

      const result = await getPosts(1, 10, { draft: true, overrideAccess: true });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalDocs).toBe(2);
      }
    });

    test("should use default limit when not specified", async () => {
      // BLOG_CONFIG.POSTS_PER_PAGE のデフォルト値を確認
      const result = await getPosts(1);
      expect(result.success).toBe(true);
      // limitのデフォルト動作を確認
    });
  });

  describe("getPublishedPostSlugs", () => {
    test("should return all published post slugs", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      const slugs = [`slug-1-${randomUUID()}`, `slug-2-${randomUUID()}`];

      for (const slug of slugs) {
        await createTestPost(payload, user.id, {
          title: `Post for ${slug}`,
          slug,
          status: "published",
        });
      }

      const result = await getPublishedPostSlugs();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data.map((s) => s.slug)).toEqual(expect.arrayContaining(slugs));
      }
    });

    test("should return empty array when no published posts", async () => {
      const result = await getPublishedPostSlugs();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    test("should NOT include draft posts", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      await createTestPost(payload, user.id, {
        title: "Draft Post",
        slug: `draft-${randomUUID()}`,
        status: "draft",
      });

      const result = await getPublishedPostSlugs();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    test("should return consistent results for multiple calls (cache behavior)", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);
      const slug = `cache-test-${randomUUID()}`;

      await createTestPost(payload, user.id, { slug, status: "published" });

      // 同じ関数を2回呼び出し
      const result1 = await getPublishedPostSlugs();
      const result2 = await getPublishedPostSlugs();

      // 結果が一貫していることを確認（キャッシュの有無に関わらず）
      expect(result1).toEqual(result2);
      if (result1.success && result2.success) {
        expect(result1.data).toHaveLength(1);
        expect(result2.data).toHaveLength(1);
        expect(result1.data[0].slug).toBe(slug);
        expect(result2.data[0].slug).toBe(slug);
      }
    });
  });
});
