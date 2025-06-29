import { test, expect } from '@playwright/test'

test.describe('ホームページ', () => {
  test.beforeEach(async ({ page }) => {
    // APIレスポンスをモック
    await page.route('https://api.example.com/articles', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            title: 'React Testing Libraryの使い方',
            category: 'React',
            description: 'React Testing Libraryを使用したテストの書き方について解説します。',
            imageUrl: '/images/react-testing.jpg',
            href: '/articles/react-testing-library',
          },
          {
            id: '2',
            title: 'TypeScriptの型安全性',
            category: 'TypeScript',
            description: 'TypeScriptの型システムを活用した安全なコードの書き方について。',
            imageUrl: '/images/typescript-safety.jpg',
            href: '/articles/typescript-safety',
          },
        ]),
      })
    })
    
    // ホームページに移動
    await page.goto('/')
  })

  test('ページが正常に読み込まれる', async ({ page }) => {
    // ページタイトルの確認
    await expect(page).toHaveTitle(/Kazk Iueda/i)
    
    // メインヘッダーの確認
    await expect(page.getByRole('heading', { name: /Welcome to Kazk Iueda/i })).toBeVisible()
    
    // 説明文の確認
    await expect(page.getByText(/Reactアプリケーションテンプレートへようこそ/)).toBeVisible()
  })

  test('ナビゲーションリンクが機能する', async ({ page }) => {
    // 「詳細を見る」ボタンをクリック
    await page.getByRole('link', { name: '詳細を見る' }).click()
    
    // aboutページに遷移することを確認
    await expect(page).toHaveURL(/\/about/)
    
    // aboutページのコンテンツが表示されることを確認
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible()
  })

  test('記事一覧が正常に表示される', async ({ page }) => {
    // 記事一覧セクションまでスクロール
    await page.getByText('記事一覧').scrollIntoViewIfNeeded()
    
    // 記事一覧のタイトルが表示されるまで待機
    await expect(page.getByText('記事一覧 (2件)')).toBeVisible({ timeout: 15000 })
    
    // 記事カードが表示されることを確認
    await expect(page.getByText('React Testing Libraryの使い方')).toBeVisible()
    await expect(page.getByText('TypeScriptの型安全性')).toBeVisible()
    
    // カテゴリーバッジの確認
    await expect(page.locator('span').filter({ hasText: 'React' }).first()).toBeVisible()
    await expect(page.locator('span').filter({ hasText: 'TypeScript' }).first()).toBeVisible()
  })



  test('記事カードのリンクが機能する', async ({ page }) => {
    // 記事一覧が読み込まれるまで待機
    await expect(page.getByText('記事一覧 (2件)')).toBeVisible({ timeout: 15000 })
    
    // 最初の記事カードのリンクを取得
    const firstArticleLink = page.getByRole('link', { name: /React Testing Libraryの使い方/ }).first()
    
    // リンクのhref属性を確認
    await expect(firstArticleLink).toHaveAttribute('href', '/articles/react-testing-library')
    
    // リンクをクリック（実際のページは存在しないので、クリック可能であることのみ確認）
    await expect(firstArticleLink).toBeVisible()
  })

  test('更新ボタンが機能する', async ({ page }) => {
    // 記事一覧が読み込まれるまで待機
    await expect(page.getByText('記事一覧 (2件)')).toBeVisible({ timeout: 15000 })
    
    // 更新ボタンをクリック
    await page.getByRole('button', { name: '更新' }).click()
    
    // 再度記事が表示されることを確認
    await expect(page.getByText('記事一覧 (2件)')).toBeVisible()
    await expect(page.getByText('React Testing Libraryの使い方')).toBeVisible()
  })

  test('レスポンシブデザインが機能する', async ({ page }) => {
    // デスクトップサイズでの確認
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.getByRole('heading', { name: /Welcome to Kazk Iueda/i })).toBeVisible()
    
    // タブレットサイズでの確認
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByRole('heading', { name: /Welcome to Kazk Iueda/i })).toBeVisible()
    
    // モバイルサイズでの確認
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByRole('heading', { name: /Welcome to Kazk Iueda/i })).toBeVisible()
  })
}) 