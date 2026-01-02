import { config as dotenvConfig } from "dotenv";
import { existsSync } from "fs";
import { join } from "path";
import { chromium } from "playwright";

// 環境変数ファイルの読み込み
const envTestPath = join(process.cwd(), "projects/.env.test");
if (existsSync(envTestPath)) {
  dotenvConfig({ path: envTestPath });
}

async function setupAuthentication() {
  console.log("🔐 Setting up authentication for E2E tests...");

  const authFile = "tests/e2e/.auth/admin.json";
  const authDir = "tests/e2e/.auth";

  // .auth ディレクトリが存在しない場合は作成
  const fs = await import("fs/promises");
  try {
    await fs.mkdir(authDir, { recursive: true });
  } catch {
    // ディレクトリが既に存在する場合は無視
  }

  try {
    await fs.access(authFile);
    console.log("✅ Authentication state file already exists");
    return;
  } catch {
    // 認証ファイルが存在しない場合は作成
  }

  // 新しいブラウザコンテキストでログイン
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: "http://localhost:3001" });
  const loginPage = await context.newPage();

  try {
    await loginPage.goto("/admin/login");
    await loginPage.waitForSelector('input[name="email"]', { timeout: 10000 });

    // E2Eテスト用の管理者アカウントでログイン
    await loginPage.fill('input[name="email"]', "e2e-admin@test.com");
    await loginPage.fill('input[name="password"]', "test-password");
    await loginPage.click('button[type="submit"]');

    await loginPage.waitForURL("**/admin**", { timeout: 15000 });

    // 認証状態を保存
    await context.storageState({ path: authFile });
    console.log("✅ Authentication state saved to", authFile);
  } finally {
    await browser.close();
  }
}

// セットアップ実行
setupAuthentication().catch((error) => {
  console.error("❌ Authentication setup failed:", error);
  process.exit(1);
});
