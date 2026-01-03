import { getPreviewSecret, loginAsAdmin } from "./helpers/auth";
import { expect, test } from "./helpers/fixtures";

// 正しいプレビューシークレットを取得
const previewSecret = getPreviewSecret();

test.describe("プレビュー機能（重要）", () => {
  test("認証なしアクセスの拒否 - シークレットなし", async ({ page }) => {
    // プレビューシークレットなしでアクセス
    const response = await page.goto("/preview?collection=posts&slug=any-slug");

    // 403ステータスを確認
    expect(response?.status()).toBe(403);
    const body = await response?.text();
    expect(body).toContain("Invalid preview secret");
  });

  test("認証なしアクセスの拒否 - 不正なシークレット", async ({ page }) => {
    // 不正なプレビューシークレットでアクセス
    const response = await page.goto(
      "/preview?collection=posts&slug=any-slug&previewSecret=invalid-secret",
    );

    // 403ステータスを確認
    expect(response?.status()).toBe(403);
    const body = await response?.text();
    expect(body).toContain("Invalid preview secret");
  });

  test("認証なしでのプレビューアクセス時は認証エラー", async ({ page }) => {
    // 認証なしで正しいシークレットとパラメータでアクセス
    const testSlug = "test-post-slug";
    const previewUrl = `/preview?collection=posts&slug=${testSlug}&previewSecret=${previewSecret}`;

    // 完全にクリーンな状態でテストするためクッキーをクリア
    await page.context().clearCookies();

    const response = await page.goto(previewUrl);

    // 認証されていない場合は403が返る
    expect(response?.status()).toBe(403);
    const body = await response?.text();
    expect(body).toContain("Unauthorized");
  });

  test("認証済み + 正しいsecretでプレビューがリダイレクトする", async ({ page, testData }) => {
    // 管理者としてログイン（既にauthenticated projectの場合はクッキーが入っているが、
    //念のためヘルパーでセットアップを確実にする）
    await loginAsAdmin(page);

    // 下書き記事のslugを使用（testDataから取得）
    const draftSlug = testData.draftPost.slug;
    const previewUrl = `/preview?collection=posts&slug=${draftSlug}&previewSecret=${previewSecret}`;

    // プレビューURLにアクセス（リダイレクトされることを確認）
    await page.goto(previewUrl, {
      waitUntil: "networkidle",
    });

    // リダイレクトが成功していることを確認（302または記事詳細ページに遷移）
    // 認証済みかつ正しいsecretの場合、記事詳細ページ（/posts/{slug}）にリダイレクトされる
    const currentUrl = page.url();
    expect(currentUrl).toContain(`/posts/${draftSlug}`);
  });
});
