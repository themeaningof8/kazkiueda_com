import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("アクセシビリティ（重要）", () => {
  test("ブログ一覧ページのアクセシビリティ", async ({ page }) => {
    await page.goto("/blog");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"]) // WCAG 2.0 AA準拠
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // より詳細なチェックが必要な場合
    if (accessibilityScanResults.violations.length > 0) {
      console.log("アクセシビリティ違反:", accessibilityScanResults.violations);
    }
  });

  test("記事詳細ページのアクセシビリティ", async ({ page }) => {
    // ブログ一覧から記事を取得
    await page.goto("/blog");

    const articles = page.locator("article");
    const articleCount = await articles.count();

    if (articleCount === 0) {
      console.log("ℹ️ 記事がないためアクセシビリティテストをスキップ");
      return;
    }

    // 最初の記事のリンクを取得して遷移
    const firstArticleLink = articles.first().locator("a").first();
    const href = await firstArticleLink.getAttribute("href");

    if (!href || !href.startsWith("/posts/")) {
      console.log("ℹ️ 有効な記事リンクがないためスキップ");
      return;
    }

    await page.goto(href);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    if (accessibilityScanResults.violations.length > 0) {
      console.log("アクセシビリティ違反:", accessibilityScanResults.violations);
    }
  });
});
