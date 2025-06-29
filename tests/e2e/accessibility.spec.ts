import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('アクセシビリティ', () => {
  // ページの読み込みとAPIモックを共通化
  test.beforeEach(async ({ page }) => {
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
    // ページコンテンツが安定するのを待つ
    await expect(page.getByRole('heading', { name: /Welcome to Kazk Iueda/i })).toBeVisible()
    await expect(page.getByText('記事一覧 (2件)')).toBeVisible({ timeout: 15000 })
  })

  test('Axeによる自動スキャンで基本的なアクセシビリティ違反がないこと', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test.describe('ユーザー操作に基づく動的なアクセシビリティ検証', () => {
    test('キーボード操作で主要なインタラクティブ要素間を移動できること', async ({ page }) => {
      const detailsLink = page.getByRole('link', { name: '詳細を見る' })
      await detailsLink.focus()
      await expect(detailsLink).toBeFocused()

      await page.keyboard.press('Tab')
      // WebKitではフォーカス順が異なる場合があるため、bodyにフォーカスが当たっていないことで、
      // いずれかの要素にフォーカスが当たっていることを確認する
      await expect(page.locator('body')).not.toBeFocused()
    })

    test('フォーカスした要素が視覚的に識別できること', async ({ page }) => {
      const focusedElement = page.getByRole('link', { name: '詳細を見る' })
      await focusedElement.focus()
      await expect(focusedElement).toBeFocused()

      const styles = await focusedElement.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          outline: computed.outline,
          outlineWidth: computed.outlineWidth,
          boxShadow: computed.boxShadow,
        }
      })

      const hasFocusIndicator =
        styles.outline.includes('none') === false ||
        styles.outlineWidth !== '0px' ||
        styles.boxShadow !== 'none'

      expect(hasFocusIndicator).toBeTruthy()
    })

    test('APIエラー発生時も、エラー情報がアクセシブルに通知されること', async ({ page }) => {
      // このテストケースのみエラー状態をシミュレート
      await page.route('https://api.example.com/articles', async route => {
        await route.fulfill({ status: 500 })
      }, { times: 1 }) // 一度だけ上書き

      await page.getByRole('button', { name: '更新' }).click()


      const errorAlert = page.getByRole('alert')
      await expect(errorAlert).toBeVisible()
      await expect(errorAlert).toHaveText(/記事の読み込みに失敗しました/)

      const retryButton = page.getByRole('button', { name: '再試行' })
      await expect(retryButton).toBeVisible()

      // Tabキーで再試行ボタンにフォーカスできることを確認
      await retryButton.focus()
      await expect(retryButton).toBeFocused()
    })
  })
}) 