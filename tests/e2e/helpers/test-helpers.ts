import { Page, expect } from '@playwright/test'

/**
 * 記事一覧が読み込まれるまで待機するヘルパー関数
 */
export async function waitForArticleListToLoad(page: Page, expectedCount = 2) {
  await expect(page.getByText(`記事一覧 (${expectedCount}件)`)).toBeVisible({ timeout: 15000 })
}

/**
 * ローディングスケルトンが表示されることを確認するヘルパー関数
 */
export async function expectLoadingSkeleton(page: Page) {
  await expect(page.locator('.animate-pulse')).toBeVisible()
}

/**
 * エラーメッセージが表示されることを確認するヘルパー関数
 */
export async function expectErrorMessage(page: Page, message?: string) {
  await expect(page.getByText('記事の読み込みに失敗しました')).toBeVisible({ timeout: 15000 })
  
  if (message) {
    await expect(page.getByText(message)).toBeVisible()
  }
  
  await expect(page.getByRole('button', { name: '再試行' })).toBeVisible()
}

/**
 * APIリクエストをモックするヘルパー関数
 */
export async function mockApiResponse(
  page: Page, 
  endpoint: string, 
  response: any, 
  status = 200
) {
  await page.route(`https://api.example.com/${endpoint}`, async route => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response)
    })
  })
}

/**
 * APIエラーをモックするヘルパー関数
 */
export async function mockApiError(
  page: Page, 
  endpoint: string, 
  errorMessage = 'サーバーエラーが発生しました',
  status = 500
) {
  await page.route(`https://api.example.com/${endpoint}`, async route => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({
        message: errorMessage,
        code: 'SERVER_ERROR'
      })
    })
  })
}

/**
 * ネットワークエラーをモックするヘルパー関数
 */
export async function mockNetworkError(page: Page, endpoint: string) {
  await page.route(`https://api.example.com/${endpoint}`, async route => {
    await route.abort('failed')
  })
}

/**
 * 遅延レスポンスをモックするヘルパー関数
 */
export async function mockSlowResponse(
  page: Page, 
  endpoint: string, 
  response: any, 
  delayMs = 3000
) {
  await page.route(`https://api.example.com/${endpoint}`, async route => {
    await new Promise(resolve => setTimeout(resolve, delayMs))
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    })
  })
}

/**
 * キーボードナビゲーションのテストヘルパー
 */
export async function testKeyboardNavigation(page: Page, expectedElements: string[]) {
  for (const elementText of expectedElements) {
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: elementText })).toBeFocused()
  }
}

/**
 * レスポンシブデザインのテストヘルパー
 */
export async function testResponsiveDesign(page: Page, selector: string) {
  const viewports = [
    { width: 1200, height: 800, name: 'Desktop' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 375, height: 667, name: 'Mobile' }
  ]

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await expect(page.locator(selector)).toBeVisible()
  }
}

/**
 * アクセシビリティ属性をチェックするヘルパー
 */
export async function checkAccessibilityAttributes(page: Page) {
  // すべてのリンクにテキストまたはaria-labelがあることを確認
  const links = page.getByRole('link')
  const linkCount = await links.count()
  
  for (let i = 0; i < linkCount; i++) {
    const link = links.nth(i)
    const text = await link.textContent()
    const ariaLabel = await link.getAttribute('aria-label')
    
    expect(text || ariaLabel).toBeTruthy()
  }

  // すべての画像にalt属性があることを確認
  const images = page.getByRole('img')
  const imageCount = await images.count()
  
  for (let i = 0; i < imageCount; i++) {
    const image = images.nth(i)
    const alt = await image.getAttribute('alt')
    
    expect(alt).toBeTruthy()
    expect(alt?.trim()).not.toBe('')
  }

  // すべてのボタンにテキストまたはaria-labelがあることを確認
  const buttons = page.getByRole('button')
  const buttonCount = await buttons.count()
  
  for (let i = 0; i < buttonCount; i++) {
    const button = buttons.nth(i)
    const text = await button.textContent()
    const ariaLabel = await button.getAttribute('aria-label')
    
    expect(text || ariaLabel).toBeTruthy()
  }
}

/**
 * テストデータ用のモック記事
 */
export const mockArticles = [
  {
    id: '1',
    title: 'React Testing Libraryの使い方',
    category: 'テクノロジー',
    description: 'React Testing Libraryを使った効果的なテストの書き方について解説します。',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
    href: '/articles/react-testing-library',
    publishedAt: '2024-01-15T10:00:00Z',
    author: {
      name: '田中太郎',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  },
  {
    id: '2',
    title: 'TypeScriptの型安全性',
    category: 'プログラミング',
    description: 'TypeScriptを使った型安全なコードの書き方とベストプラクティス。',
    imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
    href: '/articles/typescript-type-safety',
    publishedAt: '2024-01-10T14:30:00Z',
    author: {
      name: '佐藤花子',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  }
] 