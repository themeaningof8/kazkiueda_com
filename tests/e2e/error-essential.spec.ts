import { expect, test } from "@playwright/test";

test.describe("エラーハンドリング（重要）", () => {
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
});
