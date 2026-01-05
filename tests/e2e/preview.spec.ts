import { getPreviewSecret } from "./helpers/auth";
import { expect, test } from "./helpers/fixtures";

// 正しいプレビューシークレットを取得
const previewSecret = getPreviewSecret();

test.describe("プレビュー機能", () => {
  test("認証なしアクセスの拒否 - シークレットなし", async ({ page }) => {
    // プレビューシークレットなしでアクセス
    const response = await page.goto("/preview?collection=posts&slug=any-slug");

    // 403ステータスを確認
    expect(response?.status()).toBe(403);
    await expect(page.locator("text=Invalid preview secret")).toBeVisible();
  });

  test("認証なしアクセスの拒否 - 不正なシークレット", async ({ page }) => {
    // 不正なプレビューシークレットでアクセス
    const response = await page.goto(
      "/preview?collection=posts&slug=any-slug&previewSecret=invalid-secret",
    );

    // 403ステータスを確認
    expect(response?.status()).toBe(403);
    await expect(page.locator("text=Invalid preview secret")).toBeVisible();
  });

  test("Open Redirect対策 - 外部URL拒否", async ({ page }) => {
    // 外部URLをpathパラメータに指定
    const response = await page.goto(
      `/preview?collection=posts&slug=test-post&path=http://evil.com&previewSecret=${previewSecret}`,
    );

    // 400ステータスを確認
    expect(response?.status()).toBe(400);
    await expect(page.locator("text=Invalid redirect path")).toBeVisible();
  });

  test("Open Redirect対策 - スキームなし外部URL拒否", async ({ page }) => {
    // //evil.com 形式のURLを拒否
    const response = await page.goto(
      `/preview?collection=posts&slug=test-post&path=//evil.com&previewSecret=${previewSecret}`,
    );

    // 400ステータスを確認
    expect(response?.status()).toBe(400);
    await expect(page.locator("text=Invalid redirect path")).toBeVisible();
  });

  test("Open Redirect対策 - 許可されないパス拒否", async ({ page }) => {
    // /posts/ 配下以外のパスを拒否
    const response = await page.goto(
      `/preview?collection=posts&slug=test-post&path=/admin/dashboard&previewSecret=${previewSecret}`,
    );

    // 400ステータスを確認
    expect(response?.status()).toBe(400);
    await expect(page.locator("text=Invalid redirect path")).toBeVisible();
  });

  test("slug形式検証 - 不正なslug拒否", async ({ page }) => {
    // スペースを含む不正なslug
    const response = await page.goto(
      `/preview?collection=posts&slug=invalid slug&previewSecret=${previewSecret}`,
    );

    // 400ステータスを確認
    expect(response?.status()).toBe(400);
    await expect(page.locator("text=Invalid slug format")).toBeVisible();
  });

  test("コレクション検証 - サポートされないコレクション拒否", async ({ page }) => {
    // posts以外はサポートされない
    const response = await page.goto(
      `/preview?collection=users&slug=test-user&previewSecret=${previewSecret}`,
    );

    // 400ステータスを確認
    expect(response?.status()).toBe(400);
    await expect(page.locator("text=Unsupported collection")).toBeVisible();
  });

  test("必須パラメータの欠如 - slugなし", async ({ page }) => {
    // slugパラメータなし
    const response = await page.goto(`/preview?collection=posts&previewSecret=${previewSecret}`);

    // 400ステータスを確認
    expect(response?.status()).toBe(400);
    await expect(page.locator("text=Missing slug or collection")).toBeVisible();
  });

  test("必須パラメータの欠如 - collectionなし", async ({ page }) => {
    // collectionパラメータなし
    const response = await page.goto(`/preview?slug=test-post&previewSecret=${previewSecret}`);

    // 400ステータスを確認
    expect(response?.status()).toBe(400);
    await expect(page.locator("text=Missing slug or collection")).toBeVisible();
  });

  test("認証なしでのプレビューアクセス時は認証エラー", async ({ page }) => {
    // 認証なしで正しいシークレットとパラメータでアクセス
    const testSlug = "test-post-slug";
    const previewUrl = `/preview?collection=posts&slug=${testSlug}&previewSecret=${previewSecret}`;
    const response = await page.goto(previewUrl);

    // 認証されていない場合は403が返る
    expect(response?.status()).toBe(403);
    await expect(page.locator("text=Unauthorized")).toBeVisible();
  });

  test("正しいシークレットでも認証必須", async ({ page }) => {
    // 正しいシークレットでも認証がなければ403
    const testSlug = "any-valid-slug";
    const previewUrl = `/preview?collection=posts&slug=${testSlug}&path=/posts/${testSlug}&previewSecret=${previewSecret}`;
    const response = await page.goto(previewUrl);

    // 認証されていない場合は403が返る
    expect(response?.status()).toBe(403);

    // APIレスポンスの内容を直接確認
    const responseText = await response?.text();
    expect(responseText).toBe("Unauthorized");
  });
});
