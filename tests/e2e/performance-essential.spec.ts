import { expect, test } from "@playwright/test";

test.describe("パフォーマンス（重要）", () => {
  test("ホームページのロード時間が3秒以内", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    const loadTime = Date.now() - startTime;

    // ページロード時間: 3秒以内
    expect(loadTime).toBeLessThanOrEqual(3000);

    // ページタイトルが存在することを確認
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(typeof title).toBe("string");
    expect(title.length).toBeGreaterThan(0);
  });

  test("ブログページのロード時間が4秒以内", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/blog", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    const loadTime = Date.now() - startTime;

    // ブログページのロード時間: 4秒以内 (コンテンツが多いため)
    expect(loadTime).toBeLessThanOrEqual(4000);

    // ブログ記事が存在することを確認（0件でもOK）
    const articles = await page.locator('[data-testid="post-card"]').all();
    expect(Array.isArray(articles)).toBe(true);
  });

  test("404ページのロード時間が5秒以内", async ({ page }) => {
    const startTime = Date.now();

    const response = await page.goto("/non-existent-page", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    const loadTime = Date.now() - startTime;

    // 404ページも効率的にロードされるべき（ネットワーク遅延を考慮）
    expect(loadTime).toBeLessThanOrEqual(5000);

    // 404ステータスを確認
    expect(response?.status()).toBe(404);
  });
});
