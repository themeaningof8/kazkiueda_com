import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { test as setup } from "@playwright/test";
import { chromium } from "playwright";
import { createTestUser } from "../../src/test/helpers/factories";
import { getTestPayload } from "../../src/test/payload";

const authFile = "tests/e2e/.auth/admin.json";

setup("authenticate", async () => {
  // 認証ファイルが既に存在すればスキップ... というロジックは
  // 定期的に更新する必要があるため、基本的には毎回実行するか、
  // 有効期限を確認するロジックが必要。
  // ここではシンプルに毎回実行する（既存のsetup.tsと同様）

  // ディレクトリ作成
  const dir = dirname(authFile);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // まずPayloadクライアントで管理者ユーザーを作成
  const payload = await getTestPayload("auth-setup");
  try {
    // 既存ユーザーを検索
    const existingUsers = await payload.find({
      collection: "users",
      where: { email: { equals: "e2e-admin@test.com" } },
      limit: 1,
    });

    if (existingUsers.docs.length === 0) {
      // ユーザーが存在しない場合は作成
      await createTestUser(payload, {
        email: "e2e-admin@test.com",
        password: "test-password",
        role: "admin",
      });
    }

    // ブラウザでログイン
    const browser = await chromium.launch();
    const context = await browser.newContext({ baseURL: "http://localhost:3001" });
    const page = await context.newPage();

    try {
      await page.goto("/admin/login");
      await page.waitForSelector('input[name="email"]', { timeout: 30000 });

      await page.fill('input[name="email"]', "e2e-admin@test.com");
      await page.fill('input[name="password"]', "test-password");

      // ログインボタンのクリックとAPIレスポンスを待つ
      await Promise.all([
        page.waitForResponse(
          (res) => res.url().includes("/api/users/login") && res.status() === 200,
          {
            timeout: 30000,
          },
        ),
        page.click('button[type="submit"]'),
      ]);

      await page.waitForURL("**/admin**", { timeout: 30000 });

      // 認証状態を保存
      const state = await context.storageState();
      const fs = await import("node:fs/promises");
      await fs.writeFile(authFile, JSON.stringify(state, null, 2));
    } finally {
      await browser.close();
    }
  } finally {
    await payload.destroy();
  }
});
