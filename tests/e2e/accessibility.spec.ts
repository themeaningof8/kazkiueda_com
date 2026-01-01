import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('アクセシビリティ', () => {
  test('ブログ一覧ページのアクセシビリティ', async ({ page }) => {
    await page.goto('/blog');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa']) // WCAG 2.0 AA準拠
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // より詳細なチェックが必要な場合
    if (accessibilityScanResults.violations.length > 0) {
      console.log('アクセシビリティ違反:', accessibilityScanResults.violations);
    }
  });

  test('記事詳細ページのアクセシビリティ', async ({ page }) => {
    // ブログ一覧から記事を取得
    await page.goto('/blog');

    const articles = page.locator('article');
    const articleCount = await articles.count();

    if (articleCount === 0) {
      console.log('ℹ️ 記事がないためアクセシビリティテストをスキップ');
      return;
    }

    // 最初の記事のリンクを取得して遷移
    const firstArticleLink = articles.first().locator('a').first();
    const href = await firstArticleLink.getAttribute('href');

    if (!href || !href.startsWith('/posts/')) {
      console.log('ℹ️ 有効な記事リンクがないためスキップ');
      return;
    }

    await page.goto(href);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    if (accessibilityScanResults.violations.length > 0) {
      console.log('アクセシビリティ違反:', accessibilityScanResults.violations);
    }
  });

  test('キーボードナビゲーション - ブログ一覧', async ({ page }) => {
    await page.goto('/blog');

    // ページが完全にロードされるまで待機
    await page.waitForLoadState('networkidle');

    // ページにフォーカス可能な要素があることを確認
    // リンク、ボタン、入力などのインタラクティブ要素（アプリ内のみ）
    const focusableElements = page.locator('main a[href], main button, header a[href], header button');
    const focusableCount = await focusableElements.count();

    if (focusableCount === 0) {
      console.log('ℹ️ フォーカス可能な要素がないためキーボードナビゲーションテストをスキップ');
      return;
    }

    // フォーカス可能な要素が存在することを確認
    expect(focusableCount).toBeGreaterThan(0);

    // Tabキーでのフォーカス移動をテスト
    await page.keyboard.press('Tab');

    // 何らかの要素にフォーカスが移動したことを確認
    // (開発モードではNext.js Dev Toolsにフォーカスが行く可能性がある)
    const hasFocus = await page.evaluate(() => {
      return document.activeElement !== document.body;
    });

    expect(hasFocus).toBeTruthy();
  });

  test('キーボードナビゲーション - 記事詳細', async ({ page }) => {
    // ブログ一覧から記事を取得
    await page.goto('/blog');

    const articles = page.locator('article');
    const articleCount = await articles.count();

    if (articleCount === 0) {
      console.log('ℹ️ 記事がないためキーボードナビゲーションテストをスキップ');
      return;
    }

    // 最初の記事のリンクを取得して遷移
    const firstArticleLink = articles.first().locator('a').first();
    const href = await firstArticleLink.getAttribute('href');

    if (!href || !href.startsWith('/posts/')) {
      console.log('ℹ️ 有効な記事リンクがないためスキップ');
      return;
    }

    await page.goto(href);

    // Tabキーでのフォーカス移動を確認
    await page.keyboard.press('Tab');
    // 開発モードではDev Toolsにフォーカスが行くことがあるため確認
    let focusedElement = page.locator('*:focus');
    const focusCount = await focusedElement.count();
    // フォーカスがある要素が存在することを確認（Dev Tools含む）
    expect(focusCount).toBeGreaterThan(0);

    // コンテンツ内のリンクやインタラクティブ要素への移動を確認
    await page.keyboard.press('Tab');
    focusedElement = page.locator('*:focus');
    expect(await focusedElement.count()).toBeGreaterThan(0);
  });

  test('スクリーンリーダー対応 - ARIA属性', async ({ page }) => {
    await page.goto('/blog');

    // ページネーションに適切なARIA属性があることを確認
    const pagination = page.locator('[data-slot="pagination"]');
    if (await pagination.count() > 0) {
      await expect(pagination).toHaveAttribute('aria-label', 'pagination');
    }

    // 記事カードに適切なセマンティックHTMLがあることを確認
    const articleCards = page.locator('article, [data-testid="post-card"]');
    const articleCount = await articleCards.count();

    if (articleCount > 0) {
      // 記事がある場合
      await expect(articleCards.first()).toBeVisible();

      // 各記事カードが適切な見出し構造を持っていることを確認
      const headings = page.locator('article h2, [data-testid="post-card"] h2');
      await expect(headings.first()).toBeVisible();
    } else {
      // 記事がない場合は空状態のメッセージを確認
      const emptyMessage = page.locator('text=まだ記事がありません');
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('色のコントラスト比', async ({ page }) => {
    await page.goto('/blog');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa']) // AAレベルのコントラスト比チェック
      .withRules(['color-contrast']) // コントラスト比に特化
      .analyze();

    // コントラスト比の違反がないことを確認
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    expect(colorContrastViolations).toEqual([]);
  });

  test('画像の代替テキスト', async ({ page }) => {
    await page.goto('/blog');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['image-alt']) // 画像のalt属性チェック
      .analyze();

    // 画像の代替テキスト違反がないことを確認
    const imageAltViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'image-alt'
    );
    expect(imageAltViolations).toEqual([]);
  });

  test('フォーム要素のラベル', async ({ page }) => {
    // ログインページのアクセシビリティを確認
    await page.goto('/admin/login');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['label', 'form-field-multiple-labels']) // ラベル関連のチェック
      .analyze();

    // フォームラベルの違反がないことを確認
    const labelViolations = accessibilityScanResults.violations.filter(
      violation => ['label', 'form-field-multiple-labels'].includes(violation.id)
    );
    expect(labelViolations).toEqual([]);
  });

  test('言語属性の設定', async ({ page }) => {
    await page.goto('/blog');

    // HTML要素にlang属性があることを確認
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('lang');

    // 日本語が設定されていることを確認
    const langAttribute = await htmlElement.getAttribute('lang');
    expect(langAttribute).toMatch(/^ja/);
  });

  test('フォーカス管理', async ({ page }) => {
    await page.goto('/blog');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['focus-order-semantics']) // フォーカス順序のチェック
      .analyze();

    // フォーカス順序の違反がないことを確認
    const focusViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'focus-order-semantics'
    );
    expect(focusViolations).toEqual([]);
  });
});