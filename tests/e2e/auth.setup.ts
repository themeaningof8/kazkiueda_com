import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { test as setup } from "@playwright/test";

const authFile = "tests/e2e/.auth/admin.json";

setup("authenticate", async ({ page }) => {
  // 認証ファイルが既に存在すればスキップ... というロジックは
  // 定期的に更新する必要があるため、基本的には毎回実行するか、
  // 有効期限を確認するロジックが必要。
  // ここではシンプルに毎回実行する（既存のsetup.tsと同様）

  // ディレクトリ作成
  const dir = dirname(authFile);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  await page.goto("/admin/login");
  await page.waitForSelector('input[name="email"]', { timeout: 30000 });

  // E2Eテスト用の管理者アカウントでログイン
  await page.fill('input[name="email"]', "e2e-admin@test.com");
  await page.fill('input[name="password"]', "test-password");
  await page.click('button[type="submit"]');

  await page.waitForURL("**/admin**", { timeout: 30000 });

  // 認証状態を保存
  await page.context().storageState({ path: authFile });
});
