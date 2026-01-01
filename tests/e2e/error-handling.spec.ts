import { expect, test } from "@playwright/test";

/**
 * エラーハンドリングテスト
 *
 * 注意: Next.js Server Componentsはサーバーサイドでデータを取得するため、
 * Playwrightの page.route() でブラウザリクエストをインターセプトしても
 * Server Componentのデータ取得には影響しません。
 *
 * このテストでは、実際のアプリケーションの挙動をテストします:
 * - ブログページが正常に表示されること
 * - 存在しないページで適切なエラーが表示されること
 * - エラーコンポーネントが正しく機能すること
 */
test.describe("エラーハンドリング", () => {
  test("存在しないページで404が表示される", async ({ page }) => {
    // 存在しないページにアクセス
    const response = await page.goto("/non-existent-page-12345");

    // 404ステータスを確認
    expect(response?.status()).toBe(404);

    // 404ページの表示を確認（Next.jsのデフォルト404）
    // "404" または "Not Found" または "This page could not be found" のいずれか
    const pageContent = await page.content();
    const has404 =
      pageContent.includes("404") ||
      pageContent.includes("Not Found") ||
      pageContent.includes("記事が見つかりません");
    expect(has404).toBeTruthy();
  });

  test("ブログページが正常に表示される", async ({ page }) => {
    await page.goto("/blog");

    // ページタイトルの表示を確認
    await expect(page.locator("h1").filter({ hasText: "ブログ" })).toBeVisible();

    // 記事がない場合のメッセージ、または記事カードのいずれかが表示される
    const emptyMessage = page.locator("text=まだ記事がありません");
    const articleCard = page.locator("article").first();

    // どちらかが表示されることを確認
    const isEmpty = await emptyMessage.isVisible().catch(() => false);
    const hasArticles = await articleCard.isVisible().catch(() => false);

    expect(isEmpty || hasArticles).toBeTruthy();
  });

  test("存在しない記事で404が表示される", async ({ page }) => {
    // 存在しない記事にアクセス
    const response = await page.goto("/posts/non-existent-article-slug-12345");

    // 404ステータスを確認
    expect(response?.status()).toBe(404);

    // 404ページの表示を確認
    const pageContent = await page.content();
    const has404 =
      pageContent.includes("404") ||
      pageContent.includes("Not Found") ||
      pageContent.includes("記事が見つかりません");
    expect(has404).toBeTruthy();
  });

  test("プレビューシークレットなしでプレビューにアクセスすると403", async ({ page }) => {
    // プレビューシークレットなしでアクセス
    const response = await page.goto("/preview?collection=posts&slug=test-slug");

    // 403ステータスを確認
    expect(response?.status()).toBe(403);

    // エラーメッセージの表示を確認
    await expect(page.locator("text=Invalid preview secret")).toBeVisible();
  });

  test("不正なプレビューシークレットでアクセスすると403", async ({ page }) => {
    // 不正なシークレットでアクセス
    const response = await page.goto(
      "/preview?collection=posts&slug=test-slug&previewSecret=invalid",
    );

    // 403ステータスを確認
    expect(response?.status()).toBe(403);

    // エラーメッセージの表示を確認
    await expect(page.locator("text=Invalid preview secret")).toBeVisible();
  });

  test("必須パラメータなしでプレビューにアクセスすると400", async ({ page }) => {
    const previewSecret = "test-preview-secret-123456789012345678901234567890";

    // slugなしでアクセス
    const response = await page.goto(`/preview?collection=posts&previewSecret=${previewSecret}`);

    // 400ステータスを確認
    expect(response?.status()).toBe(400);

    // エラーメッセージの表示を確認
    await expect(page.locator("text=Missing slug or collection")).toBeVisible();
  });

  test("ページが正常にロードされることを確認", async ({ page }) => {
    // ブログページを開く
    await page.goto("/blog");

    // ページが完全にロードされることを確認
    await page.waitForLoadState("networkidle");

    // 基本的なページ構造が存在することを確認
    await expect(page.locator("h1").filter({ hasText: "ブログ" })).toBeVisible();
  });

  test("管理画面のログインページが表示される", async ({ page }) => {
    await page.goto("/admin/login", { waitUntil: "networkidle" });

    // Payload CMSの読み込みを待機
    await page.waitForLoadState("domcontentloaded");

    // ログインフォームが表示されることを確認（タイムアウトを延長）
    await expect(page.locator('input[name="email"]').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[name="password"]').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('button[type="submit"]').first()).toBeVisible({ timeout: 15000 });
  });
});
