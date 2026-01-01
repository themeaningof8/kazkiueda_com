import { expect, test } from "@playwright/test";

/**
 * 本番環境用のSmoke Tests
 *
 * 注意事項:
 * - 読み取り専用のテストのみ実行
 * - データベースへの書き込みは行わない
 * - 認証が必要な機能はテストしない（本番環境のセキュリティのため）
 * - 実行時間を短く保つ（重要なページのみ）
 */
test.describe("本番環境 Smoke Tests", () => {
  test("ホームページが正常に表示される", async ({ page }) => {
    await page.goto("/");

    // ページが正常に読み込まれることを確認
    await expect(page).toHaveURL("/");

    // 基本的なページ構造が存在することを確認
    const mainContent = page.locator('main, [role="main"], .container, .mx-auto').first();
    await expect(mainContent).toBeVisible();

    // タイトルが存在することを確認
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("ブログページが正常に表示される", async ({ page }) => {
    await page.goto("/blog");

    // ページが正常に読み込まれることを確認
    await expect(page).toHaveURL("/blog");

    // ヘッダーの表示確認
    await expect(page.locator("h1").filter({ hasText: "ブログ" })).toBeVisible();

    // 基本的なページ構造が存在することを確認
    const mainContent = page.locator('main, [role="main"], .container, .mx-auto').first();
    await expect(mainContent).toBeVisible();
  });

  test("公開された記事の詳細ページが正常に表示される", async ({ page }) => {
    // ブログページに移動
    await page.goto("/blog");
    await page.waitForLoadState("networkidle");

    // 記事カードまたはリンクを探す
    const articleLink = page.locator('article a, [data-testid="post-card"] a').first();

    // 記事が存在する場合のみテスト
    const articleCount = await articleLink.count();
    if (articleCount > 0) {
      // 最初の記事のURLを取得
      const href = await articleLink.getAttribute("href");
      if (href) {
        await page.goto(href);

        // 記事詳細ページが正常に読み込まれることを確認
        await expect(page.locator("article, main")).toBeVisible();

        // タイトルが存在することを確認
        await expect(page.locator("h1").first()).toBeVisible();
      }
    } else {
      // 記事がない場合はスキップ（本番環境で記事がない場合も正常）
      test.skip();
    }
  });

  test("404ページが正常に表示される", async ({ page }) => {
    await page.goto("/non-existent-page-12345");

    // 404ページが表示されることを確認（Next.jsのデフォルト404またはカスタム404）
    // 404ページの内容は実装によって異なるため、ページが読み込まれることのみ確認
    await expect(page).toHaveURL(/.*non-existent-page-12345.*/);

    // ページがエラーなく読み込まれることを確認
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("アクセシビリティ: 基本的なARIA属性が存在する", async ({ page }) => {
    await page.goto("/");

    // main要素またはrole="main"が存在することを確認
    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible();

    // ナビゲーション要素が存在することを確認（存在する場合）
    const nav = page.locator('nav, [role="navigation"]').first();
    if ((await nav.count()) > 0) {
      await expect(nav).toBeVisible();
    }
  });
});
