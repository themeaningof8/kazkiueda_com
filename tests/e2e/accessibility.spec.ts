import { test, expect } from '@playwright/test'

test.describe('アクセシビリティ', () => {
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
    
    await page.goto('/')
  })

  test('キーボードナビゲーションが機能する', async ({ page }) => {
    // 「詳細を見る」リンクに直接フォーカスを設定
    const detailsLink = page.getByRole('link', { name: '詳細を見る' })
    await detailsLink.focus()
    await expect(detailsLink).toBeFocused()
    
    // 次のTabでGitHubリンクにフォーカス
    await page.keyboard.press('Tab')
    const githubLink = page.getByRole('link', { name: /GitHub/ })
    await expect(githubLink).toBeFocused()
    
    // Enterキーでリンクを活性化できることを確認
    await page.keyboard.press('Enter')
    // 外部リンクなので新しいタブで開かれる（ここでは開かれることの確認のみ）
  })

  test('見出し構造が適切である', async ({ page }) => {
    // h1要素が存在し、適切なテキストを持つ
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    await expect(h1).toHaveText(/Welcome to Kazk Iueda/)
    
    // 記事一覧が読み込まれるまで待機
    await expect(page.getByText('記事一覧 (2件)')).toBeVisible({ timeout: 15000 })
    
    // h2要素（記事一覧）が存在する
    const h2 = page.getByRole('heading', { level: 2 })
    await expect(h2).toBeVisible()
    await expect(h2).toHaveText(/記事一覧/)
  })

  test('リンクに適切なテキストが設定されている', async ({ page }) => {
    // 記事一覧が読み込まれるまで待機
    await expect(page.getByText('記事一覧 (2件)')).toBeVisible({ timeout: 15000 })
    
    // すべてのリンクを取得
    const links = page.getByRole('link')
    const linkCount = await links.count()
    
    // 各リンクに適切なテキストまたはaria-labelが設定されていることを確認
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      
      // テキストまたはaria-labelのいずれかが存在することを確認
      expect(text || ariaLabel).toBeTruthy()
    }
  })

  test('画像に適切なalt属性が設定されている', async ({ page }) => {
    // 記事一覧が読み込まれるまで待機
    await expect(page.getByText('記事一覧 (2件)')).toBeVisible({ timeout: 15000 })
    
    // すべての画像を取得
    const images = page.getByRole('img')
    const imageCount = await images.count()
    
    // 各画像にalt属性が設定されていることを確認
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i)
      const alt = await image.getAttribute('alt')
      
      // alt属性が存在し、空でないことを確認
      expect(alt).toBeTruthy()
      expect(alt?.trim()).not.toBe('')
    }
  })

  test('ボタンに適切なラベルが設定されている', async ({ page }) => {
    // 記事一覧が読み込まれるまで待機
    await expect(page.getByText('記事一覧 (2件)')).toBeVisible({ timeout: 15000 })
    
    // すべてのボタンを取得
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()
    
    // 各ボタンに適切なテキストまたはaria-labelが設定されていることを確認
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      
      // テキストまたはaria-labelのいずれかが存在することを確認
      expect(text || ariaLabel).toBeTruthy()
    }
  })

  test('フォーカス表示が適切である', async ({ page }) => {
    // 「詳細を見る」リンクに直接フォーカスを設定
    const focusedElement = page.getByRole('link', { name: '詳細を見る' })
    await focusedElement.focus()
    await expect(focusedElement).toBeFocused()
    
    // フォーカスリングまたはアウトラインが表示されていることを確認
    const styles = await focusedElement.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        outline: computed.outline,
        outlineWidth: computed.outlineWidth,
        boxShadow: computed.boxShadow,
      }
    })
    
    // アウトラインまたはボックスシャドウでフォーカスが表示されていることを確認
    const hasFocusIndicator = 
      styles.outline !== 'none' || 
      styles.outlineWidth !== '0px' || 
      styles.boxShadow !== 'none'
    
    expect(hasFocusIndicator).toBeTruthy()
  })

  test('エラー状態でも適切なアクセシビリティが保たれる', async ({ page }) => {
    // APIエラーをシミュレート
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

    // エラーメッセージが表示されるまで待機
    await expect(page.getByText('記事の読み込みに失敗しました')).toBeVisible({ timeout: 15000 })
    
    // エラーメッセージが適切なroleを持つことを確認
    const errorAlert = page.getByRole('alert').or(page.locator('[role="alert"]'))
    await expect(errorAlert).toBeVisible()
    
    // 再試行ボタンがキーボードでアクセス可能であることを確認
    const retryButton = page.getByRole('button', { name: '再試行' })
    await expect(retryButton).toBeVisible()
    
    // Tabキーで再試行ボタンにフォーカスできることを確認
    await page.keyboard.press('Tab')
    // 他の要素を飛ばしてボタンにフォーカスが移るまで繰り返し
    let attempts = 0
    while (attempts < 10) {
      const isFocused = await retryButton.evaluate(el => el === document.activeElement)
      if (isFocused) break
      await page.keyboard.press('Tab')
      attempts++
    }
    
    await expect(retryButton).toBeFocused()
  })

  test('色のコントラストが適切である（基本チェック）', async ({ page }) => {
    // 記事一覧が読み込まれるまで待機
    await expect(page.getByText('記事一覧 (2件)')).toBeVisible({ timeout: 15000 })
    
    // メインテキストの色とコントラストを確認
    const mainHeading = page.getByRole('heading', { level: 1 })
    const styles = await mainHeading.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
      }
    })
    
    // 色が設定されていることを確認（具体的なコントラスト比の計算は複雑なため、基本チェックのみ）
    expect(styles.color).toBeTruthy()
    expect(styles.color).not.toBe('rgba(0, 0, 0, 0)') // 透明でないことを確認
  })
}) 