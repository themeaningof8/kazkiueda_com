import { expect, test } from "@playwright/test";

test.describe("記事詳細ページ", () => {
  test("存在しない記事の404表示", async ({ page }) => {
    const nonExistentSlug = `non-existent-post-${Date.now()}`;

    const response = await page.goto(`/posts/${nonExistentSlug}`);

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

  test("ブログ一覧から記事詳細へのナビゲーション", async ({ page }) => {
    // ブログ一覧ページに移動
    await page.goto("/blog");

    // 記事カードを取得
    const articles = page.locator("article");
    const articleCount = await articles.count();

    if (articleCount > 0) {
      // 最初の記事のリンクを取得
      const firstArticleLink = articles.first().locator("a").first();
      const href = await firstArticleLink.getAttribute("href");

      if (href?.startsWith("/posts/")) {
        // リンクをクリック
        await firstArticleLink.click();

        // 記事詳細ページに遷移したことを確認
        await expect(page).toHaveURL(/\/posts\//);

        // 記事タイトル（h1）が表示されていることを確認
        await expect(page.locator("h1")).toBeVisible();

        // ブラウザバックで一覧に戻れることを確認
        await page.goBack();
        await expect(page).toHaveURL("/blog");
      }
    } else {
      console.log("ℹ️ 記事がないためナビゲーションテストをスキップ");
    }
  });

  test("記事詳細ページの構造確認", async ({ page }) => {
    // ブログ一覧ページから記事を取得
    await page.goto("/blog");

    const articles = page.locator("article");
    const articleCount = await articles.count();

    if (articleCount > 0) {
      // 最初の記事のリンクを取得して遷移
      const firstArticleLink = articles.first().locator("a").first();
      const href = await firstArticleLink.getAttribute("href");

      if (href?.startsWith("/posts/")) {
        await page.goto(href);

        // 基本構造の確認
        // タイトル（h1）
        await expect(page.locator("h1")).toBeVisible();

        // コンテンツ領域
        const content = page.locator(".prose, [data-rich-text], article, main");
        await expect(content.first()).toBeVisible();
      }
    } else {
      console.log("ℹ️ 記事がないため構造確認テストをスキップ");
    }
  });

  test("記事ページのメタデータ", async ({ page }) => {
    // ブログ一覧ページから記事を取得
    await page.goto("/blog");

    const articles = page.locator("article");
    const articleCount = await articles.count();

    if (articleCount > 0) {
      // 最初の記事のリンクを取得して遷移
      const firstArticleLink = articles.first().locator("a").first();
      const href = await firstArticleLink.getAttribute("href");

      if (href?.startsWith("/posts/")) {
        await page.goto(href);

        // ページタイトルが設定されていることを確認
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title).not.toBe("");

        // Open Graphタグの確認
        const ogType = page.locator('meta[property="og:type"]');
        if ((await ogType.count()) > 0) {
          await expect(ogType).toHaveAttribute("content", "article");
        }
      }
    } else {
      console.log("ℹ️ 記事がないためメタデータテストをスキップ");
    }
  });

  test("下書き記事は公開されない", async ({ page }) => {
    // 下書き用の固定slug
    const draftSlug = "e2e-test-draft-post";

    // 下書き記事にアクセス
    const response = await page.goto(`/posts/${draftSlug}`);

    // 下書き記事は公開されていないので、404になるはず
    expect(response?.status()).toBe(404);

    // 404ページの表示確認
    const pageContent = await page.content();
    const has404 =
      pageContent.includes("404") ||
      pageContent.includes("Not Found") ||
      pageContent.includes("記事が見つかりません");
    expect(has404).toBeTruthy();
  });
});
