import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '@playwright/test'

test.describe('アクセシビリティ', () => {
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

    await page.goto('/')

    // ページコンテンツが安定するのを待つ
    await expect(page.getByRole('heading', { name: /Welcome to Kazk Iueda/i })).toBeVisible()
    await expect(page.getByText('記事一覧 (1件)')).toBeVisible({ timeout: 15000 })
  })

  test('Axeによる自動スキャンで基本的なアクセシビリティ違反がないこと', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test.describe('ユーザー操作に基づく動的なアクセシビリティ検証', () => {
    test('キーボード操作で主要なインタラクティブ要素間を移動できること', async ({ page }) => {
      // ページが完全に読み込まれるのを確認
      await expect(page.getByRole('link', { name: '詳細を見る' })).toBeVisible()
      
      // 主要な要素が個別にフォーカス可能であることを確認
      const detailsLink = page.getByRole('link', { name: '詳細を見る' })
      await detailsLink.focus()
      await expect(detailsLink).toBeFocused()
      
      const githubLink = page.getByRole('link', { name: /GitHub/ })
      await githubLink.focus()
      await expect(githubLink).toBeFocused()
      
      const updateButton = page.getByRole('button', { name: '更新' })
      await updateButton.focus()
      await expect(updateButton).toBeFocused()
      
      const articleLink = page.getByRole('link', { name: /こんにちは世界/ })
      await articleLink.focus()
      await expect(articleLink).toBeFocused()
    })

    test('フォーカスした要素が視覚的に識別できること', async ({ page }) => {
      // 詳細を見るボタンにフォーカス
      await page.getByRole('link', { name: '詳細を見る' }).focus()
      
      // フォーカスリングが表示されていることを確認
      const focusedElement = page.getByRole('link', { name: '詳細を見る' })
      await expect(focusedElement).toBeFocused()
      
      // フォーカススタイルがあることを確認（アウトライン、ボックスシャドウなど）
      const focusStyles = await focusedElement.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow
        }
      })
      
      // フォーカススタイルが適用されていることを確認
      const hasFocusStyle = focusStyles.outline !== 'none' || 
                          focusStyles.outlineWidth !== '0px' || 
                          focusStyles.boxShadow !== 'none'
      expect(hasFocusStyle).toBe(true)
    })
  })
}) 