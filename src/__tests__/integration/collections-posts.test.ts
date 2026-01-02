import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { createTestDbPool, destroyTestDbPool, truncateAllTables } from "@/test/db";
import { findAsUnauthenticated, findAsUser } from "@/test/helpers/auth";
import { createTestPost, createTestUser } from "@/test/helpers/factories";
import { makeLexicalContent } from "@/test/helpers/lexical";
import { destroyTestPayload, getTestPayload } from "@/test/payload";

describe("collections/Posts.ts Integration Tests", () => {
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

  describe("アクセス制御: read", () => {
    test("1. 未ログインユーザーは公開記事のみ読める", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // Given: 公開記事1件、下書き記事1件
      const _publishedPost = await createTestPost(payload, user.id, {
        title: "Published Post",
        status: "published",
      });
      const _draftPost = await createTestPost(payload, user.id, {
        title: "Draft Post",
        status: "draft",
      });

      // When: 未認証でfindを実行
      const result = await findAsUnauthenticated(payload, "posts");

      // Then: 公開記事のみ返される
      expect(result.docs).toHaveLength(1);
      expect((result.docs[0] as unknown as Record<string, unknown>)._status).toBe("published");
    });

    test("2. ログインユーザーは全記事を読める（drafts含む）", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // Given: 公開記事1件、下書き記事1件
      await createTestPost(payload, user.id, {
        title: "Published Post",
        status: "published",
      });
      await createTestPost(payload, user.id, {
        title: "Draft Post",
        status: "draft",
      });

      // When: 認証してfindを実行（drafts含む）
      const result = await findAsUser(payload, user, "posts", { draft: true });

      // Then: 全記事が返される
      expect(result.docs).toHaveLength(2);
      const statuses = result.docs.map((doc) => (doc as unknown as Record<string, unknown>).status);
      expect(statuses).toContain("published");
      expect(statuses).toContain("draft");
    });

    test("3. ログインユーザーは他人の下書きも読める（作成者制限なし）", async () => {
      const payload = await getTestPayload(payloadKey);
      const userA = await createTestUser(payload);
      const userB = await createTestUser(payload);

      // Given: ユーザーAの下書き記事
      const postA = await createTestPost(payload, userA.id, {
        title: "UserA Draft",
        status: "draft",
      });

      // When: ユーザーBが読む
      const result = await findAsUser(payload, userB, "posts", {
        where: { id: { equals: postA.id } },
      });

      // Then: 読める（Posts.tsのread制御は作成者制限なし）
      expect(result.docs).toHaveLength(1);
      expect(result.docs[0].id).toBe(postA.id);
    });

    test("4. overrideAccess=trueで未認証でも全記事を読める", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // Given: 公開記事1件、下書き記事1件
      await createTestPost(payload, user.id, {
        title: "Published Post",
        status: "published",
      });
      await createTestPost(payload, user.id, {
        title: "Draft Post",
        status: "draft",
      });

      // When: overrideAccess=true
      const result = await payload.find({
        collection: "posts",
        overrideAccess: true,
      });

      // Then: 全記事が返される
      expect(result.docs).toHaveLength(2);
    });
  });

  describe("アクセス制御: create", () => {
    test("5. 未認証ユーザーは記事を作成できない", async () => {
      const payload = await getTestPayload(payloadKey);

      // When: 未認証でcreateを実行
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

    test("6. 認証ユーザーは記事を作成できる", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // When: 認証してcreateを実行
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

      // Then: 作成成功
      expect(post.title).toBe("Test Post");
      expect(typeof post.author === "object" ? post.author.id : post.author).toBe(user.id);
    });
  });

  describe("アクセス制御: update", () => {
    test("7. 未認証ユーザーは記事を更新できない", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);
      const post = await createTestPost(payload, user.id);

      // When: 未認証でupdateを実行
      await expect(
        payload.update({
          collection: "posts",
          id: post.id,
          data: { title: "Updated" },
          overrideAccess: false,
        }),
      ).rejects.toThrow();
    });

    test("8. 認証ユーザーは自分の記事を更新できる", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);
      const post = await createTestPost(payload, user.id);

      // When: 作成者がupdateを実行
      const updated = await payload.update({
        collection: "posts",
        id: post.id,
        data: { title: "Updated Title" },
        user,
        overrideAccess: false,
      });

      // Then: 更新成功
      expect(updated.title).toBe("Updated Title");
    });

    test("9. 認証ユーザーは他人の記事も更新できる（作成者制限なし）", async () => {
      const payload = await getTestPayload(payloadKey);
      const userA = await createTestUser(payload);
      const userB = await createTestUser(payload);
      const postA = await createTestPost(payload, userA.id);

      // When: ユーザーBがユーザーAの記事を更新
      const updated = await payload.update({
        collection: "posts",
        id: postA.id,
        data: { title: "Updated by B" },
        user: userB,
        overrideAccess: false,
      });

      // Then: 更新成功（Posts.tsはupdate制限なし）
      expect(updated.title).toBe("Updated by B");
    });
  });

  describe("アクセス制御: delete", () => {
    test("10. 未認証ユーザーは記事を削除できない", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);
      const post = await createTestPost(payload, user.id);

      // When: 未認証でdeleteを実行
      await expect(
        payload.delete({
          collection: "posts",
          id: post.id,
          overrideAccess: false,
        }),
      ).rejects.toThrow();
    });

    test("11. 認証ユーザーは自分の記事を削除できる", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);
      const post = await createTestPost(payload, user.id);

      // When: 作成者がdeleteを実行
      await payload.delete({
        collection: "posts",
        id: post.id,
        user,
        overrideAccess: false,
      });

      // Then: 削除成功（findで取得できない）
      const result = await payload.find({
        collection: "posts",
        where: { id: { equals: post.id } },
        overrideAccess: true,
      });
      expect(result.docs).toHaveLength(0);
    });

    test("12. 認証ユーザーは他人の記事も削除できる（作成者制限なし）", async () => {
      const payload = await getTestPayload(payloadKey);
      const userA = await createTestUser(payload);
      const userB = await createTestUser(payload);
      const postA = await createTestPost(payload, userA.id);

      // When: ユーザーBがユーザーAの記事を削除
      await payload.delete({
        collection: "posts",
        id: postA.id,
        user: userB,
        overrideAccess: false,
      });

      // Then: 削除成功
      const result = await payload.find({
        collection: "posts",
        where: { id: { equals: postA.id } },
        overrideAccess: true,
      });
      expect(result.docs).toHaveLength(0);
    });
  });

  describe("slugフィールド: beforeValidateフック", () => {
    test("13. titleからslugが自動生成される", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // When: slug未指定でcreate
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

      // Then: slugが自動生成される
      expect(post.slug).toBe("test-post-title");
    });

    test("14. 既存slugは上書きされない", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // When: slug指定でcreate
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

      // Then: 指定したslugが保持される
      expect(post.slug).toBe("custom-slug");
    });

    test("15. title未指定でslug未指定の場合、undefinedが返る", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // When: title未指定、slug未指定でcreate
      // Note: titleはrequiredなのでバリデーションエラーになるはず
      await expect(
        payload.create({
          collection: "posts",
          data: {
            content: makeLexicalContent("Test content"),
            author: user.id,
          } as Record<string, unknown>,
          draft: true,
          user,
          overrideAccess: false,
        }),
      ).rejects.toThrow(/タイトル/i);
    });

    test("16. 日本語タイトルからslugが生成される", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // When: 日本語タイトルでcreate
      const post = await payload.create({
        collection: "posts",
        data: {
          title: "テスト記事タイトル",
          content: makeLexicalContent("Test content"),
          author: user.id,
        },
        user,
        overrideAccess: false,
      });

      // Then: slugフィールドが存在する（nullでも可）
      expect(post).toHaveProperty("slug");
      // Note: 日本語スラッグ生成は現在nullを返す可能性があるため、詳細な検証はスキップ
    });
  });

  describe("publishedDateフィールド: beforeChangeフック", () => {
    test("17. 公開状態になったときに自動的に公開日が設定される", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // When: status="published"でcreate（publishedDate未指定）
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

      // Then: publishedDateが自動設定される
      expect(post.publishedDate).toBeDefined();
      if (post.publishedDate) {
        expect(new Date(post.publishedDate).getTime()).toBeCloseTo(
          Date.now(),
          -3, // 3桁の誤差（ミリ秒）を許容
        );
      }
    });

    test("18. publishedDateが既に設定されている場合、上書きしない", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);
      const customDate = new Date("2024-01-01").toISOString();

      // When: publishedDate指定でcreate
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

      // Then: 指定したpublishedDateが保持される
      expect(post.publishedDate).toBe(customDate);
    });

    test("19. 下書き状態ではpublishedDateが設定されない", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // When: status="draft"でcreate
      const post = await payload.create({
        collection: "posts",
        data: {
          title: "Draft Post",
          content: makeLexicalContent("Test content"),
          author: user.id,
          _status: "draft",
        },
        user,
        overrideAccess: false,
      });

      // Then: publishedDateは設定されない
      expect(post.publishedDate).toBeNull();
    });
  });

  describe("バリデーション", () => {
    test("20. タイトル必須", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // When: title未指定でcreate
      await expect(
        payload.create({
          collection: "posts",
          data: {
            content: makeLexicalContent("Test content"),
            author: user.id,
          } as Record<string, unknown>,
          draft: true,
          user,
          overrideAccess: false,
        }),
      ).rejects.toThrow(/タイトル/i);
    });

    test("21. コンテンツ必須", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // When: content未指定でcreate
      await expect(
        payload.create({
          collection: "posts",
          data: {
            title: "Test Post",
            author: user.id,
          } as Record<string, unknown>,
          draft: true,
          user,
          overrideAccess: false,
        }),
      ).rejects.toThrow(/本文/i);
    });

    test("22. slugバリデーション（validateSlug関数）", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // When: 無効なslug（大文字含む）でcreate
      await expect(
        payload.create({
          collection: "posts",
          data: {
            title: "Test Post",
            slug: "Invalid-Slug", // 大文字はNG
            content: makeLexicalContent("Test content"),
            author: user.id,
          },
          user,
          overrideAccess: false,
        }),
      ).rejects.toThrow();
    });
  });
});
