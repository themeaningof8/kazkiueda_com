import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { createTestDbPool, destroyTestDbPool, truncateAllTables } from "@/test/db";
import { createAdminUser, createRegularUser, findAsUser } from "@/test/helpers/auth";
import { destroyTestPayload, getTestPayload } from "@/test/payload";

describe("collections/Users.ts Integration Tests", () => {
  const pool = createTestDbPool();
  const payloadKey = `collections-users-${Date.now()}`;

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
    test("1. ユーザーは自分のデータのみ読める", async () => {
      const payload = await getTestPayload(payloadKey);
      const userA = await createRegularUser(payload);
      const _userB = await createRegularUser(payload);

      // When: ユーザーAが自分のデータを取得
      const result = await findAsUser(payload, userA, "users", {
        where: { id: { equals: userA.id } },
      });

      // Then: 自分のデータのみ取得できる
      expect(result.docs).toHaveLength(1);
      expect(result.docs[0].id).toBe(userA.id);
    });

    test("2. 管理者は全ユーザーを読める", async () => {
      const payload = await getTestPayload(payloadKey);
      const admin = await createAdminUser(payload);
      const _user1 = await createRegularUser(payload);
      const _user2 = await createRegularUser(payload);

      // When: 管理者が全ユーザーを取得
      const result = await findAsUser(payload, admin, "users");

      // Then: 全ユーザーを取得できる
      expect(result.totalDocs).toBeGreaterThanOrEqual(3); // admin, user1, user2
    });

    test("3. 未認証ユーザーはユーザー情報を読めない", async () => {
      const payload = await getTestPayload(payloadKey);
      await createRegularUser(payload);

      // When: 未認証でユーザーを取得
      // Then: エラーが発生する
      await expect(
        payload.find({
          collection: "users",
          overrideAccess: false,
          // userなし = 未認証
        }),
      ).rejects.toThrow(/forbidden|not allowed/i);
    });
  });

  describe("アクセス制御: create", () => {
    // Test 4を独立したdescribeブロックに分離して、確実にコレクションが空の状態で実行されるようにする
    describe("初回ユーザー作成", () => {
      test("4. 初回ユーザー作成が可能（コレクションが空の場合）", async () => {
        const payload = await getTestPayload(payloadKey);

        // Given: コレクションが空であることを確認
        const countBefore = await payload.count({ collection: "users", overrideAccess: true });
        expect(countBefore.totalDocs).toBe(0);

        const email = `first-user-${Date.now()}@test.com`;

        // When: 未認証でユーザー作成
        const user = await payload.create({
          collection: "users",
          data: {
            email,
            password: "test1234",
          },
          draft: true,
          overrideAccess: false,
        });

        // Then: 作成成功（IDが返される）
        expect(user.id).toBeDefined();

        // 作成されたユーザーを検証
        const createdUser = await payload.findByID({
          collection: "users",
          id: user.id,
          overrideAccess: true,
        });
        expect(createdUser.email).toBe(email);
      });
    });

    test("5. 既存ユーザーがいる場合、管理者のみ作成可能", async () => {
      const payload = await getTestPayload(payloadKey);
      // Given: 既存ユーザーがいる状態
      await createRegularUser(payload);

      // When: 未認証でユーザー作成を試みる
      await expect(
        payload.create({
          collection: "users",
          data: {
            email: `unauthorized-${Date.now()}@test.com`,
            password: "test1234",
          },
          draft: true,
          overrideAccess: false,
        }),
      ).rejects.toThrow();

      // When: 管理者でユーザー作成
      const admin = await createAdminUser(payload);
      const newUser = await payload.create({
        collection: "users",
        data: {
          email: `admin-created-${Date.now()}@test.com`,
          password: "test1234",
        },
        draft: true,
        user: admin,
        overrideAccess: false,
      });

      // Then: 作成成功
      expect(newUser.email).toBeDefined();
    });
  });

  describe("アクセス制御: update", () => {
    test("6. ユーザーは自分のデータのみ更新できる", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createRegularUser(payload);

      // When: 自分のデータを更新
      const updated = await payload.update({
        collection: "users",
        id: user.id,
        data: { name: "Updated Name" },
        user,
        overrideAccess: false,
      });

      // Then: 更新成功
      expect(updated.name).toBe("Updated Name");
    });

    test("7. 管理者は全ユーザーを更新できる", async () => {
      const payload = await getTestPayload(payloadKey);
      const admin = await createAdminUser(payload);
      const user = await createRegularUser(payload);

      // When: 管理者が他ユーザーのデータを更新
      const updated = await payload.update({
        collection: "users",
        id: user.id,
        data: { name: "Updated by Admin" },
        user: admin,
        overrideAccess: false,
      });

      // Then: 更新成功
      expect(updated.name).toBe("Updated by Admin");
    });
  });

  describe("アクセス制御: delete", () => {
    test("8. 管理者のみ削除可能", async () => {
      const payload = await getTestPayload(payloadKey);
      const admin = await createAdminUser(payload);
      const user = await createRegularUser(payload);

      // When: 一般ユーザーが削除を試みる
      // Then: エラーが発生する
      await expect(
        payload.delete({
          collection: "users",
          id: user.id,
          user,
          overrideAccess: false,
        }),
      ).rejects.toThrow(/forbidden|not allowed/i);

      // When: 管理者が削除
      await payload.delete({
        collection: "users",
        id: user.id,
        user: admin,
        overrideAccess: false,
      });

      // Then: 削除成功
      const result = await payload.find({
        collection: "users",
        where: { id: { equals: user.id } },
        overrideAccess: true,
      });
      expect(result.docs).toHaveLength(0);
    });
  });

  describe("フィールドアクセス制御: email", () => {
    test("9. ユーザーは自分のメールのみ読める", async () => {
      const payload = await getTestPayload(payloadKey);
      const userA = await createRegularUser(payload);
      const userB = await createRegularUser(payload);

      // When: ユーザーAがユーザーBのメールを取得しようとする
      const result = await findAsUser(payload, userA, "users", {
        where: { id: { equals: userB.id } },
        select: { email: true },
      });

      // Then: メールは取得できない（アクセス制御により隠される）
      if (result.docs.length > 0) {
        expect((result.docs[0] as unknown as Record<string, unknown>).email).toBeUndefined();
      }
    });

    test("10. 管理者は全メールを読める", async () => {
      const payload = await getTestPayload(payloadKey);
      const admin = await createAdminUser(payload);
      const user = await createRegularUser(payload);

      // When: 管理者が他ユーザーのメールを取得
      const result = await findAsUser(payload, admin, "users", {
        where: { id: { equals: user.id } },
        select: { email: true },
      });

      // Then: メールを取得できる
      expect(result.docs).toHaveLength(1);
      expect((result.docs[0] as unknown as Record<string, unknown>).email).toBe(user.email);
    });
  });

  describe("フィールドアクセス制御: role", () => {
    test("11. 管理者のみrole変更可能", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createRegularUser(payload);
      const admin = await createAdminUser(payload);

      // When: 一般ユーザーがrole変更を試みる
      const result = await payload.update({
        collection: "users",
        id: user.id,
        data: { role: "admin" },
        user,
        overrideAccess: false,
      });

      // Then: エラーにはならないが、roleは変更されない（silently ignored）
      expect(result.role).toBe("user");

      // When: 管理者がrole変更
      const updated = await payload.update({
        collection: "users",
        id: user.id,
        data: { role: "admin" },
        user: admin,
        overrideAccess: false,
      });

      // Then: 更新成功
      expect(updated.role).toBe("admin");
    });
  });

  describe("hasRole型ガード", () => {
    test("12. 管理者ロールの判定とアクセス制御の動作確認", async () => {
      const payload = await getTestPayload(payloadKey);
      const admin = await createAdminUser(payload);
      const user = await createRegularUser(payload);

      // When: 管理者が全ユーザーを取得
      const result = await findAsUser(payload, admin, "users");

      // Then: 管理者は全ユーザーを読める（hasRole型ガードが機能している）
      expect(result.totalDocs).toBeGreaterThanOrEqual(2);

      // When: 一般ユーザーが全ユーザーを取得しようとする
      const userResult = await findAsUser(payload, user, "users");

      // Then: 自分のデータのみ取得できる
      expect(userResult.totalDocs).toBe(1);
      expect(userResult.docs[0].id).toBe(user.id);
    });
  });

  describe("パスワードハッシュ化", () => {
    test("13. パスワードが正しくハッシュ化され、認証に使用できる", async () => {
      const payload = await getTestPayload(payloadKey);
      const email = `hash-test-${Date.now()}@test.com`;
      const password = "plain-password";

      // When: ユーザーを作成
      await payload.create({
        collection: "users",
        data: { email, password },
        draft: true,
        overrideAccess: true,
      });

      // Then: 正しいパスワードで認証成功
      const { user, token } = await payload.login({
        collection: "users",
        data: { email, password },
      });
      expect(user).toBeDefined();
      expect(token).toBeDefined();

      // Then: 間違ったパスワードで認証失敗
      await expect(
        payload.login({
          collection: "users",
          data: { email, password: "wrong-password" },
        }),
      ).rejects.toThrow();
    });
  });

  describe("バリデーション", () => {
    test("14. メールアドレス重複チェック", async () => {
      const payload = await getTestPayload(payloadKey);
      const email = `duplicate-${Date.now()}@test.com`;

      // When: 同じメールアドレスで2回ユーザー作成
      await payload.create({
        collection: "users",
        data: {
          email,
          password: "test1234",
        },
        draft: true,
        overrideAccess: true,
      });

      // Then: 2回目はエラー
      await expect(
        payload.create({
          collection: "users",
          data: {
            email, // 同じメールアドレス
            password: "test1234",
          },
          draft: true,
          overrideAccess: true,
        }),
      ).rejects.toThrow(/invalid|email|duplicate|unique/i);
    });

    test("15. メールアドレス形式チェック", async () => {
      const payload = await getTestPayload(payloadKey);

      // When: 無効なメールアドレス形式で作成
      await expect(
        payload.create({
          collection: "users",
          data: {
            email: "invalid-email-format",
            password: "test1234",
          },
          draft: true,
          overrideAccess: true,
        }),
      ).rejects.toThrow();
    });
  });
});
