import { promises as fs } from "node:fs";
import { test as base, type TestInfo } from "@playwright/test";
import type { Payload } from "payload";
import { chromium } from "playwright";
import type { Post, User } from "@/payload-types";
import {
  createBulkTestPosts,
  createTestPost,
  createTestUser,
} from "../../../src/test/helpers/factories";
import { getTestPayload } from "../../../src/test/payload";
import type { E2ETestData } from "./test-data";

type TestFixtures = {
  payload: Payload;
  testData: E2ETestData; // 共有データ（読み取り専用テスト用）
  isolatedData: E2ETestData; // 独立データ（変更テスト用）
};

export const test = base.extend<TestFixtures>({
  // biome-ignore lint/correctness/noEmptyPattern: Playwright requires destructuring to identify dependencies
  payload: async ({}, use) => {
    const payload = await getTestPayload("e2e-fixture");
    await use(payload);
    await payload.destroy();
  },

  testData: async ({ payload }, use) => {
    // 既存のテストデータを確認（高速化のため）
    const testDataPath = "tests/e2e/.test-data.json";
    try {
      const existingData = await fs.readFile(testDataPath, "utf-8");
      const parsedData = JSON.parse(existingData) as E2ETestData;
      console.log("✅ Using cached test data");
      await use(parsedData);
      return;
    } catch {
      // キャッシュが存在しない場合は新規作成
      console.log("📝 Creating fresh test data...");
    }

    try {
      // 既存の管理者ユーザーを検索、なければ作成
      let adminUser: User;
      try {
        const existingUsers = await payload.find({
          collection: "users",
          where: { email: { equals: "e2e-admin@test.com" } },
          limit: 1,
        });
        if (existingUsers.docs.length > 0) {
          adminUser = existingUsers.docs[0];
          console.log("✅ Found existing admin user");
        } else {
          throw new Error("User not found");
        }
      } catch {
        // ユーザーが存在しない場合は作成
        console.log("👤 Creating admin user...");
        adminUser = await createTestUser(payload, {
          email: "e2e-admin@test.com",
          password: "test-password",
          role: "admin",
        });
        console.log("✅ Admin user created");
      }

      // 既存のテスト記事を確認
      const existingPosts = await payload.find({
        collection: "posts",
        where: { title: { contains: "Bulk Post" } },
        limit: 20,
      });

      let posts: Post[];
      if (existingPosts.docs.length >= 10) {
        // 既存の記事を使用
        posts = existingPosts.docs.slice(0, 10);
        console.log(`✅ Found ${posts.length} existing test posts`);
      } else {
        // 不足分を作成
        const postsToCreate = 10 - existingPosts.docs.length;
        if (postsToCreate > 0) {
          console.log(`📝 Creating ${postsToCreate} additional test posts...`);
          const newPosts = await createBulkTestPosts(payload, adminUser.id, postsToCreate, {
            status: "published",
          });
          posts = [...existingPosts.docs, ...newPosts];
        } else {
          posts = existingPosts.docs;
        }
        console.log("✅ Test posts ready");
      }

      // 下書き記事を確認
      let draftPost: Post;
      try {
        const existingDraft = await payload.find({
          collection: "posts",
          where: { slug: { equals: "e2e-test-draft-post" } },
          limit: 1,
        });
        if (existingDraft.docs.length > 0) {
          draftPost = existingDraft.docs[0];
          console.log("✅ Found existing draft post");
        } else {
          throw new Error("Draft not found");
        }
      } catch {
        // 下書き記事が存在しない場合は作成
        console.log("📝 Creating draft post...");
        draftPost = await createTestPost(payload, adminUser.id, {
          title: "E2E Test Draft Post",
          slug: "e2e-test-draft-post",
          status: "draft",
        });
        console.log("✅ Draft post created");
      }

      const testData = {
        version: "1.0.0",
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          password: "test-password",
        },
        publishedPosts: posts.map((p) => ({
          id: typeof p.id === "number" ? p.id : Number(p.id),
          slug: p.slug || "",
          title: p.title,
        })),
        draftPost: {
          id: typeof draftPost.id === "number" ? draftPost.id : Number(draftPost.id),
          slug: draftPost.slug || "",
        },
      };

      // テストデータを .test-data.json に保存（他のテストで使用）
      const testDataPath = "tests/e2e/.test-data.json";
      await fs.writeFile(testDataPath, JSON.stringify(testData, null, 2));
      console.log("✅ Test data saved to .test-data.json");

      // 認証状態ファイルを作成（テスト実行前に必要）
      const authFile = "tests/e2e/.auth/admin.json";
      const authDir = "tests/e2e/.auth";

      // .auth ディレクトリが存在しない場合は作成
      try {
        await fs.mkdir(authDir, { recursive: true });
      } catch {
        // ディレクトリが既に存在する場合は無視
      }

      try {
        await fs.access(authFile);
        // 認証ファイルが既に存在する場合は何もしない
        console.log("✅ Authentication state file exists");
      } catch {
        // 認証ファイルが存在しない場合は作成
        console.log("🔐 Creating authentication state...");

        // 新しいブラウザコンテキストでログイン
        console.log(
          `🔗 Connecting to ${process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001"}/admin/login for setup...`,
        );
        const browser = await chromium.launch();
        const context = await browser.newContext({ baseURL: "http://localhost:3001" });
        const loginPage = await context.newPage();

        try {
          await loginPage.goto("/admin/login");
          await loginPage.waitForSelector('input[name="email"]', { timeout: 30000 });

          await loginPage.fill('input[name="email"]', testData.adminUser.email);
          await loginPage.fill('input[name="password"]', testData.adminUser.password);
          await loginPage.click('button[type="submit"]');

          await loginPage.waitForURL("**/admin**", { timeout: 30000 });

          // 認証状態を保存
          await context.storageState({ path: authFile });
          console.log("✅ Authentication state saved");
        } finally {
          await browser.close();
        }
      }

      await use(testData);
    } catch (error) {
      console.error("Test data generation failed:", error);
      throw error;
    }
  },

  // テストごとに独立したデータを提供
  isolatedData: async ({ payload }, use, testInfo: TestInfo) => {
    // 動的インポートでESモジュール問題を回避
    const { cleanDatabase, seedDatabase } = await import("./seed");

    // テスト前にクリーンアップ
    await cleanDatabase(payload, { keepUsers: true });
    const seededData = await seedDatabase(payload);

    await use(seededData);

    // テスト後のクリーンアップ（失敗時も実行される）
    try {
      await cleanDatabase(payload, { keepUsers: true });
      console.log(`✅ [${testInfo.title}] Test data cleaned up`);
    } catch (error) {
      console.error(`❌ [${testInfo.title}] Cleanup failed:`, error);
      // エラーは無視（次のテストのクリーンアップでリカバリ）
    }
  },
});

export { expect } from "@playwright/test";
