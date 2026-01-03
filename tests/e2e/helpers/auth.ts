import { expect, type Page } from "@playwright/test";
import { requireE2ETestData } from "./test-data";

/**
 * Payload CMSの管理者ログインを行うヘルパー
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  const testData = await requireE2ETestData();

  await page.goto("/admin/login");

  // すでにログイン済みでダッシュボードにリダイレクトされた場合は何もしない
  if (page.url().includes("/admin") && !page.url().includes("/login")) {
    console.log("✅ Already logged in, skipping login form");
    return;
  }

  // ログインフォームが表示されるのを待つ
  try {
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
  } catch {
    // フォームが見つからない場合、すでにログイン済みか別のページにいる可能性がある
    if (page.url().includes("/admin")) {
      console.log("✅ Admin dashboard detected, assuming logged in");
      return;
    }
    throw new Error(`Login form not found at ${page.url()}`);
  }

  // ログイン情報の入力
  await page.fill('input[name="email"]', testData.adminUser.email);
  await page.fill('input[name="password"]', testData.adminUser.password);

  // ログインボタンのクリック
  await Promise.all([
    page.waitForResponse((res) => res.url().includes("/api/users/login") && res.status() === 200, {
      timeout: 10000,
    }),
    page.click('button[type="submit"]'),
  ]);

  // ログイン成功の確認（ダッシュボードページへの遷移）
  await page.waitForURL("**/admin**", { timeout: 10000 });

  // 認証Cookieがセットされるのを待つ（/preview が 403 にならないように）
  // document.cookie は HttpOnly クッキーが見えないため、page.context().cookies() をポーリングする
  await expect
    .poll(
      async () => {
        const cookies = await page.context().cookies();
        return cookies.some((c) => c.name === "payload-token");
      },
      {
        timeout: 20000,
        message: "payload-token cookie was not set after login",
      },
    )
    .toBeTruthy();
}

/**
 * ログアウトを行うヘルパー
 */
export async function logout(page: Page): Promise<void> {
  // ログアウトボタンのクリック（Payload CMSのデフォルトUIを想定）
  await page.click('[data-testid="logout-button"], .logout-button, [aria-label="Logout"]');

  // ログアウト成功の確認（ログインページへの遷移）
  await page.waitForURL("**/admin/login**", { timeout: 5000 });
}

/**
 * 認証状態を確認するヘルパー
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Payload CMSの認証Cookieが存在するか確認
    const cookies = await page.context().cookies();
    return cookies.some((cookie) => cookie.name.includes("payload-token"));
  } catch {
    return false;
  }
}

/**
 * プレビューシークレットを取得するヘルパー
 */
export function getPreviewSecret(): string {
  const secret = process.env.PAYLOAD_PREVIEW_SECRET;
  if (!secret) {
    throw new Error("PAYLOAD_PREVIEW_SECRET environment variable is not set");
  }
  return secret;
}
