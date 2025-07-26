import { test, expect } from '@playwright/test'

test.describe('エラーハンドリング', () => {
  test('APIエラー時にエラーメッセージが表示される', async ({ page }) => {
    // Markdownファイルのリクエストでエラーを返す
    await page.route('/articles/2024-06-01-hello-world.md', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'Internal Server Error'
      })
    })

    await page.route('/articles/2024-01-20-nextjs-draft.md', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'Internal Server Error'
      })
    })

    await page.goto('/')

    // エラーメッセージが表示されることを確認
    await expect(page.getByRole('heading', { name: '記事一覧の取得に失敗しました' })).toBeVisible({ timeout: 15000 })
    
    // 再試行ボタンが表示されることを確認
    await expect(page.getByRole('button', { name: '再試行' })).toBeVisible()
  })

  test('ネットワークエラー時にエラーメッセージが表示される', async ({ page }) => {
    // ネットワークエラーをシミュレート（リクエストを中断）
    await page.route('/articles/2024-06-01-hello-world.md', async route => {
      await route.abort('failed')
    })

    await page.route('/articles/2024-01-20-nextjs-draft.md', async route => {
      await route.abort('failed')
    })

    await page.goto('/')

    // エラーメッセージが表示されることを確認
    await expect(page.getByRole('heading', { name: '記事一覧の取得に失敗しました' })).toBeVisible({ timeout: 15000 })
    
    // 再試行ボタンが表示されることを確認
    await expect(page.getByRole('button', { name: '再試行' })).toBeVisible()
  })

  test('遅いAPIレスポンス時にローディング状態が表示される', async ({ page }) => {
    // 3秒の遅延を設定
    await page.route('/articles/2024-06-01-hello-world.md', async route => {
      await new Promise(resolve => setTimeout(resolve, 3000))
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

これはテスト記事です。`
      })
    })

    await page.route('/articles/2024-01-20-nextjs-draft.md', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: `---
title: "Next.js 14の新機能"
published: false
---

# Next.js 14の新機能`
      })
    })

    await page.goto('/')

    // ローディングスケルトンが表示されることを確認
    await expect(page.locator('.animate-pulse')).toBeVisible()
    
    // 3秒以上ローディングが続くことを確認
    await page.waitForTimeout(2000)
    await expect(page.locator('.animate-pulse')).toBeVisible()
    
    // 最終的にコンテンツが表示されることを確認
    await expect(page.getByText('記事一覧 (1件)')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('こんにちは世界')).toBeVisible()
  })
}) 