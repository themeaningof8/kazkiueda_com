import { test, expect } from '@playwright/test'

test.describe('ホームページ', () => {
  test.beforeEach(async ({ page }) => {
    // Markdownファイルをモック
    await page.route('/articles/2024-06-01-hello-world.md', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: `---
title: "こんにちは世界"
description: "このサイトの最初のテスト記事です"
category: "テスト"
publishedAt: "2024-06-01T10:00:00Z"
published: true
imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"
author:
  name: "Kaz Kiueda"
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
---

# こんにちは世界

これはテスト記事です。

\`\`\`js
console.log("Hello, world!");
\`\`\`

:::widget{type="clock"} :::`,
      })
    })

    await page.route('/articles/2024-01-20-nextjs-draft.md', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: `---
title: "Next.js 14の新機能"
description: "Next.js 14で追加された新機能について詳しく解説します（執筆中）"
category: "テクノロジー"
publishedAt: "2024-01-20T09:00:00Z"
published: false
imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"
author:
  name: "Kaz Kiueda"
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
---

# Next.js 14の新機能

> ⚠️ この記事は執筆中です

Next.js 14では、以下の新機能が追加されました：

## 主要な新機能

この部分は現在執筆中です...`,
      })
    })

    await page.route('/articles/2024-01-10-typescript-safety.md', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'text/plain',
        body: 'Not Found',
      })
    })

    await page.goto('/')
  })

  test('ページタイトルとヒーローセクションが正常に表示される', async ({ page }) => {
    // ページタイトルの確認
    await expect(page).toHaveTitle(/Kazk Iueda/)

    // ヒーローセクションの確認
    await expect(page.getByRole('heading', { name: /Welcome to Kazk Iueda/i })).toBeVisible()
    await expect(
      page.getByText(/Reactアプリケーションテンプレートへようこそ/)
    ).toBeVisible()

    // アクションボタンの確認
    await expect(page.getByRole('link', { name: '詳細を見る' })).toBeVisible()
    await expect(page.getByRole('link', { name: /GitHub/ })).toBeVisible()
  })

  test('記事一覧が正常に表示される', async ({ page }) => {
    // ページコンテンツが安定するのを待つ
    await expect(page.getByRole('heading', { name: /Welcome to Kazk Iueda/i })).toBeVisible()
    
    // 記事一覧のタイトルが表示されるまで待機 (公開記事1件)
    await expect(page.getByText('記事一覧 (1件)')).toBeVisible({ timeout: 15000 })
    
    // 記事カードが表示されることを確認
    await expect(page.getByText('こんにちは世界')).toBeVisible()
    
    // カテゴリーバッジの確認
    await expect(page.locator('span').filter({ hasText: 'テスト' }).first()).toBeVisible()
  })

  test('記事カードのリンクが機能する', async ({ page }) => {
    // 記事一覧が読み込まれるまで待機
    await expect(page.getByText('記事一覧 (1件)')).toBeVisible({ timeout: 15000 })
    
    // 最初の記事カードのリンクを取得
    const firstArticleLink = page.getByRole('link', { name: /こんにちは世界/ }).first()
    
    // リンクが存在することを確認
    await expect(firstArticleLink).toBeVisible()
    
    // href属性が正しく設定されていることを確認
    await expect(firstArticleLink).toHaveAttribute('href', '/articles/hello-world')
  })

  test('更新ボタンが機能する', async ({ page }) => {
    // 記事一覧が読み込まれるまで待機
    await expect(page.getByText('記事一覧 (1件)')).toBeVisible({ timeout: 15000 })
    
    // 更新ボタンをクリック
    await page.getByRole('button', { name: '更新' }).click()
    
    // ローディング状態が一瞬表示される（確認は任意）
    // 更新後も記事一覧が表示されることを確認
    await expect(page.getByText('記事一覧 (1件)')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('こんにちは世界')).toBeVisible()
  })

  test('ナビゲーションメニューが機能する', async ({ page }) => {
    // Aboutページへのリンクをクリック
    await page.getByRole('link', { name: '詳細を見る' }).click()
    
    // Aboutページに遷移することを確認
    await expect(page.url()).toContain('/about')
  })
}) 