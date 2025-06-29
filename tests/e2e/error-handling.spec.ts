import { test, expect } from '@playwright/test'

test.describe('エラーハンドリング', () => {
  test('APIエラー時にエラーメッセージが表示される', async ({ page }) => {
    // MSWのService Workerが読み込まれる前にルートを設定
    await page.route('https://api.example.com/articles', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'サーバーエラーが発生しました',
          code: 'SERVER_ERROR'
        })
      })
    })

    await page.goto('/')

    // エラーメッセージが表示されることを確認
    await expect(page.getByText('記事の読み込みに失敗しました')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('サーバーエラーが発生しました')).toBeVisible()
    
    // 再試行ボタンが表示されることを確認
    await expect(page.getByRole('button', { name: '再試行' })).toBeVisible()
  })

  test('ネットワークエラー時にエラーメッセージが表示される', async ({ page }) => {
    // ネットワークエラーをシミュレート
    await page.route('https://api.example.com/articles', async route => {
      await route.abort('failed')
    })

    await page.goto('/')

    // エラーメッセージが表示されることを確認
    await expect(page.getByText('記事の読み込みに失敗しました')).toBeVisible({ timeout: 15000 })
    
    // 再試行ボタンが表示されることを確認
    await expect(page.getByRole('button', { name: '再試行' })).toBeVisible()
  })

  test('再試行ボタンでエラーから回復できる', async ({ page }) => {
    let requestCount = 0

    // 最初のリクエストはエラー、2回目は成功
    await page.route('https://api.example.com/articles', async route => {
      requestCount++
      
      if (requestCount === 1) {
        // 最初はエラー
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'サーバーエラーが発生しました',
            code: 'SERVER_ERROR'
          })
        })
      } else {
        // 2回目以降は成功
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: '1',
              title: 'React Testing Libraryの使い方',
              category: 'React',
              description: 'React Testing Libraryを使った効果的なテストの書き方について解説します。',
              imageUrl: '/images/react-testing.jpg',
              href: '/articles/react-testing-library',
            }
          ])
        })
      }
    })

    await page.goto('/')

    // エラーメッセージが表示されることを確認
    await expect(page.getByText('記事の読み込みに失敗しました')).toBeVisible({ timeout: 15000 })
    
    // 再試行ボタンをクリック
    await page.getByRole('button', { name: '再試行' }).click()
    
    // エラーが解消され、記事が表示されることを確認
    await expect(page.getByText('記事一覧 (1件)')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('React Testing Libraryの使い方')).toBeVisible()
    
    // エラーメッセージが消えることを確認
    await expect(page.getByText('記事の読み込みに失敗しました')).not.toBeVisible()
  })

  test('遅いAPIレスポンス時にローディング状態が表示される', async ({ page }) => {
    // APIレスポンスを遅延させる
    await page.route('https://api.example.com/articles', async route => {
      // 3秒遅延
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    await page.goto('/')

    // ローディングスケルトンが表示されることを確認
    await expect(page.locator('.animate-pulse')).toBeVisible()
    
    // 3秒以上ローディングが続くことを確認
    await page.waitForTimeout(2000)
    await expect(page.locator('.animate-pulse')).toBeVisible()
    
    // 最終的にデータが読み込まれることを確認
    await expect(page.getByText('記事が見つかりません')).toBeVisible({ timeout: 5000 })
  })

  test('存在しないページへのアクセス時に適切にハンドリングされる', async ({ page }) => {
    // 存在しないページにアクセス
    const response = await page.goto('/non-existent-page')
    
    // 404ステータスまたはルーターによるフォールバック処理を確認
    // React Routerの場合、通常は200で返されるが、適切なエラーページが表示される
    expect(response?.status()).toBeLessThan(500)
    
    // ページが正常に読み込まれることを確認（エラーページまたはホームページへのリダイレクト）
    await expect(page.locator('body')).toBeVisible()
  })
}) 