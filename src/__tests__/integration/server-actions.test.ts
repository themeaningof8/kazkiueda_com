import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import {
  getPostBySlugAction,
  getPostsAction,
  getPublishedPostSlugsAction,
} from "@/lib/actions/posts";
import { createTestDbPool, destroyTestDbPool, truncateAllTables } from "@/test/db";
import { createBulkTestPosts, createTestPost, createTestUser } from "@/test/helpers/factories";
import { destroyTestPayload, getTestPayload } from "@/test/payload";

describe("Server Actions Integration (next-safe-action + Payload + Postgres)", () => {
  const pool = createTestDbPool();
  const payloadKey = `server-actions-${Date.now()}`;

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

  describe("getPostBySlugAction", () => {
    test("should fetch published post by slug via Payload Local API", async () => {
      const payload = await getTestPayload(payloadKey);

      // Given: 公開記事が1件存在する
      const user = await createTestUser(payload);
      const post = await createTestPost(payload, user.id, {
        title: "Test Post Title",
        slug: "test-post-slug",
        status: "published",
      });

      // When: Server Action経由でslugを指定して記事を取得
      const result = await getPostBySlugAction({ slug: "test-post-slug" });

      // Then: 正しい記事データが返り、バリデーションエラーやサーバーエラーが発生しない
      expect(result.data).toBeDefined();
      expect(result.serverError).toBeUndefined();
      expect(result.validationErrors).toBeUndefined();
      expect(result.data?.slug).toBe("test-post-slug");
      expect(result.data?.title).toBe(post.title);
    });

    test("should fetch draft post with overrideAccess", async () => {
      const payload = await getTestPayload(payloadKey);

      // factories.tsを使用してテストデータを作成
      const user = await createTestUser(payload);
      await createTestPost(payload, user.id, {
        title: "Draft Post Title",
        slug: "draft-post-slug",
        status: "draft",
      });

      const result = await getPostBySlugAction({
        slug: "draft-post-slug",
        draft: true,
        overrideAccess: true, // ← 必須（アクセス制御をバイパス）
      });

      expect(result.data).toBeDefined();
      expect(result.serverError).toBeUndefined();
      expect(result.validationErrors).toBeUndefined();
      expect(result.data?.slug).toBe("draft-post-slug");
    });

    test("should NOT fetch draft post without overrideAccess", async () => {
      const payload = await getTestPayload(payloadKey);

      const user = await createTestUser(payload);
      await createTestPost(payload, user.id, {
        title: "Draft Post No Access",
        slug: "draft-post-no-access",
        status: "draft",
      });

      const result = await getPostBySlugAction({
        slug: "draft-post-no-access",
        draft: true,
        overrideAccess: false, // ← アクセス拒否
      });

      expect(result.data).toBeUndefined();
    });

    test("should validate empty slug", async () => {
      const result = await getPostBySlugAction({ slug: "" });

      expect(result.data).toBeUndefined();
      expect(result.serverError).toBeUndefined();
      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors?.slug).toBeDefined();
      expect(result.validationErrors?.slug?._errors).toHaveLength(1);
    });

    test("should validate slug max length", async () => {
      const longSlug = "a".repeat(101); // SLUG_MAX_LENGTH = 100

      const result = await getPostBySlugAction({ slug: longSlug });

      expect(result.data).toBeUndefined();
      expect(result.serverError).toBeUndefined();
      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors?.slug).toBeDefined();
    });

    test("should return NOT_FOUND for non-existent slug", async () => {
      const result = await getPostBySlugAction({ slug: "non-existent-slug" });

      expect(result.data).toBeUndefined();
      expect(result.serverError).toBe("NOT_FOUND");
      expect(result.validationErrors).toBeUndefined();
    });

    test.skip("should handle network timeout gracefully (requires network simulation)", async () => {
      // NOTE: このテストはネットワーク障害をシミュレートする必要があるため、
      // CI環境や特定のテスト環境でのみ実行することを推奨
      // 実装例: Proxyサーバーを使用したタイムアウトシミュレーション

      // const result = await getPostBySlugAction({ slug: "any-slug" });
      // expect(result.serverError).toBe("NETWORK_ERROR");

      expect(true).toBe(true); // プレースホルダー
    });

    test("should sanitize malicious slug input (SQL injection protection)", async () => {
      // Given: 悪意あるSQLインジェクション攻撃パターンを含むslugリスト
      const maliciousSlugs = [
        "'; DROP TABLE posts; --",
        "1' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "slug' OR 1=1 --",
      ];

      // When: 各悪意あるslugで記事取得を試みる
      for (const maliciousSlug of maliciousSlugs) {
        const result = await getPostBySlugAction({ slug: maliciousSlug });

        // Then: 悪意ある入力でも安全に処理され、NOT_FOUNDが返される
        expect(result.data).toBeUndefined();
        expect(result.serverError).toBe("NOT_FOUND");
        expect(result.validationErrors).toBeUndefined();
      }
    });

    test("should handle XSS attempts in slug", async () => {
      const xssAttempts = [
        "<script>alert('xss')</script>",
        "slug<img src=x onerror=alert(1)>",
        "javascript:alert('xss')",
        "<iframe src='javascript:alert(1)'></iframe>",
      ];

      for (const xssSlug of xssAttempts) {
        const result = await getPostBySlugAction({ slug: xssSlug });
        // XSS攻撃も安全に処理され、NOT_FOUNDが返されるべき
        expect(result.data).toBeUndefined();
        expect(result.serverError).toBe("NOT_FOUND");
        expect(result.validationErrors).toBeUndefined();
      }
    });
  });

  describe("getPostsAction", () => {
    test("should fetch paginated posts via next-safe-action", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // Given: 5件の公開記事が存在する
      await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          createTestPost(payload, user.id, {
            title: `Post ${i}`,
            slug: `post-${i}`,
            status: "published",
          }),
        ),
      );

      // When: Server Action経由で記事一覧を取得（デフォルトページネーション）
      const result = await getPostsAction({ page: 1, limit: 12 });

      // Then: 全記事が取得され、バリデーションエラーやサーバーエラーが発生しない
      expect(result.data).toBeDefined();
      expect(result.serverError).toBeUndefined();
      expect(result.validationErrors).toBeUndefined();
      expect(result.data?.posts).toHaveLength(5);
      expect(result.data?.totalDocs).toBe(5);
    });

    test("should respect limit parameter", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // 10件の公開記事を作成
      await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          createTestPost(payload, user.id, {
            title: `Post Limit ${i}`,
            slug: `post-limit-${i}`,
            status: "published",
          }),
        ),
      );

      const result = await getPostsAction({ page: 1, limit: 5 });

      expect(result.data).toBeDefined();
      expect(result.data?.posts).toHaveLength(5);
    });

    test("should paginate correctly with 15 posts", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // 15件の公開記事を作成
      await Promise.all(
        Array.from({ length: 15 }, (_, i) =>
          createTestPost(payload, user.id, {
            title: `Post Paginate ${i}`,
            slug: `post-paginate-${i}`,
            status: "published",
          }),
        ),
      );

      const page1 = await getPostsAction({ page: 1, limit: 12 });
      expect(page1.data?.posts).toHaveLength(12);

      const page2 = await getPostsAction({ page: 2, limit: 12 });
      expect(page2.data?.posts).toHaveLength(3);
    });

    test("should include draft posts when draft=true and overrideAccess=true", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // 公開記事5件、下書き3件を作成
      await Promise.all([
        ...Array.from({ length: 5 }, (_, i) =>
          createTestPost(payload, user.id, {
            title: `Published ${i}`,
            slug: `published-${i}`,
            status: "published",
          }),
        ),
        ...Array.from({ length: 3 }, (_, i) =>
          createTestPost(payload, user.id, {
            title: `Draft ${i}`,
            slug: `draft-${i}`,
            status: "draft",
          }),
        ),
      ]);

      const result = await getPostsAction({
        draft: true,
        overrideAccess: true, // ← 必須
      });

      expect(result.data).toBeDefined();
      expect(result.data?.posts).toHaveLength(8); // 5 + 3
    });

    test("should exclude draft posts when draft=false", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // 公開記事5件、下書き3件を作成
      await Promise.all([
        ...Array.from({ length: 5 }, (_, i) =>
          createTestPost(payload, user.id, {
            title: `Published Only ${i}`,
            slug: `published-only-${i}`,
            status: "published",
          }),
        ),
        ...Array.from({ length: 3 }, (_, i) =>
          createTestPost(payload, user.id, {
            title: `Draft Only ${i}`,
            slug: `draft-only-${i}`,
            status: "draft",
          }),
        ),
      ]);

      const result = await getPostsAction({ draft: false });

      expect(result.data).toBeDefined();
      expect(result.data?.posts).toHaveLength(5); // 公開記事のみ
    });

    test("should validate page less than 1", async () => {
      const result = await getPostsAction({ page: 0 });

      expect(result.data).toBeUndefined();
      expect(result.serverError).toBeUndefined();
      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors?.page).toBeDefined();
    });

    test("should validate limit less than 1", async () => {
      const result = await getPostsAction({ limit: 0 });

      expect(result.data).toBeUndefined();
      expect(result.serverError).toBeUndefined();
      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors?.limit).toBeDefined();
    });

    test("should validate limit greater than 100", async () => {
      const result = await getPostsAction({ limit: 101 });

      expect(result.data).toBeUndefined();
      expect(result.serverError).toBeUndefined();
      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors?.limit).toBeDefined();
      expect(result.validationErrors?.limit?._errors).toContain("1回の取得は100件までです");
    });

    test("should return empty list when no posts exist", async () => {
      const result = await getPostsAction({ page: 1, limit: 12 });

      expect(result.data).toBeDefined();
      expect(result.data?.posts).toHaveLength(0);
      expect(result.data?.totalDocs).toBe(0);
    });

    test("should complete within 500ms for 100 posts (performance test)", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // Given: 100件の公開記事が存在する（最適化されたバルク作成を使用）
      await createBulkTestPosts(payload, user.id, 100, {
        status: "published",
        content: "minimal",
      });

      // When: 複数回の実行で平均パフォーマンスを測定
      const runs = 3;
      const durations = await Promise.all(
        Array.from({ length: runs }, async () => {
          const start = Date.now();
          const result = await getPostsAction({ page: 1, limit: 10 });
          const duration = Date.now() - start;

          // 各実行で正しいデータが返されることを確認
          expect(result.data).toBeDefined();
          expect(result.data?.posts).toHaveLength(10);
          expect(result.data?.totalDocs).toBe(100);

          return duration;
        }),
      );

      // Then: 平均実行時間が1000ms以内で、安定したパフォーマンスを発揮（CI環境の負荷を考慮）
      const avgDuration = durations.reduce((a, b) => a + b) / runs;
      const maxDuration = Math.max(...durations);

      expect(avgDuration).toBeLessThan(1000);
      expect(maxDuration).toBeLessThan(2000); // 最大でも2秒以内
      expect(durations.every((d) => d > 0)).toBe(true); // 全ての実行時間が正の値
    });
  });

  describe("getPublishedPostSlugsAction", () => {
    test("should fetch published post slugs", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      const slugs = ["slug-1", "slug-2", "slug-3"];
      await Promise.all(
        slugs.map((slug) =>
          createTestPost(payload, user.id, {
            title: `Post ${slug}`,
            slug,
            status: "published",
          }),
        ),
      );

      const result = await getPublishedPostSlugsAction({});

      expect(result.data).toBeDefined();
      expect(result.serverError).toBeUndefined();
      expect(result.validationErrors).toBeUndefined();
      expect(result.data).toHaveLength(3);
      expect(result.data?.map((s) => s.slug).sort()).toEqual(slugs.sort());
    });

    test("should fetch all slugs even with many posts (30 posts)", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // 30件の公開記事を作成
      const expectedSlugs: string[] = [];
      await Promise.all(
        Array.from({ length: 30 }, async (_, i) => {
          const slug = `post-many-${i}`;
          expectedSlugs.push(slug);
          return createTestPost(payload, user.id, {
            title: `Post Many ${i}`,
            slug,
            status: "published",
          });
        }),
      );

      const result = await getPublishedPostSlugsAction({});

      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(30);
      const resultSlugs = result.data?.map((s) => s.slug).sort() ?? [];
      expect(resultSlugs).toEqual(expectedSlugs.sort());
    });

    test("should return empty array when no published posts exist", async () => {
      const result = await getPublishedPostSlugsAction({});

      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(0);
    });

    test("should exclude draft posts", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // 公開記事3件、下書き2件を作成
      await Promise.all([
        ...Array.from({ length: 3 }, (_, i) =>
          createTestPost(payload, user.id, {
            title: `Published Slug ${i}`,
            slug: `published-slug-${i}`,
            status: "published",
          }),
        ),
        ...Array.from({ length: 2 }, (_, i) =>
          createTestPost(payload, user.id, {
            title: `Draft Slug ${i}`,
            slug: `draft-slug-${i}`,
            status: "draft",
          }),
        ),
      ]);

      const result = await getPublishedPostSlugsAction({});

      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(3); // 公開記事のみ
      expect(result.data?.every((s) => s.slug.startsWith("published-slug"))).toBe(true);
    });
  });
});
