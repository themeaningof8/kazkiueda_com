import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { server } from '@/mocks/server'

import { ArticleList } from './ArticleList'

describe('ArticleList', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('記事一覧を正常に表示する', async () => {
    render(<ArticleList />)

    // ローディング状態の確認（スケルトンが表示される）
    const skeletonElements = screen
      .getAllByRole('generic')
      .filter(el => el.className.includes('animate-pulse'))
    expect(skeletonElements.length).toBeGreaterThan(0)

    // データ読み込み完了まで待機
    await waitFor(() => {
      expect(screen.getByText('記事一覧 (2件)')).toBeInTheDocument()
    })

    // 記事が表示されることを確認
    expect(screen.getByText('React Testing Libraryの使い方')).toBeInTheDocument()
    expect(screen.getByText('TypeScriptの型安全性')).toBeInTheDocument()
    expect(screen.getByText('テクノロジー')).toBeInTheDocument()
    expect(screen.getByText('プログラミング')).toBeInTheDocument()
  })

  it('ローディング状態を正しく表示する', () => {
    // 遅延レスポンスのハンドラーに置き換え
    server.use(
      http.get('https://api.example.com/articles', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return HttpResponse.json([])
      })
    )

    render(<ArticleList />)

    // ローディングスケルトンの確認
    const skeletonElements = screen
      .getAllByRole('generic')
      .filter(el => el.className.includes('animate-pulse'))
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('エラー状態を正しく表示し、再試行ボタンが機能する', async () => {
    // エラーレスポンスを返すハンドラーに置き換え
    server.use(
      http.get('https://api.example.com/articles', () => {
        return HttpResponse.json(
          { message: 'サーバーエラーが発生しました', code: 'SERVER_ERROR' },
          { status: 500 }
        )
      })
    )

    const user = userEvent.setup()
    render(<ArticleList />)

    // エラーメッセージの表示を待機
    await waitFor(() => {
      expect(screen.getByText('記事の読み込みに失敗しました')).toBeInTheDocument()
    })

    expect(screen.getByText('サーバーエラーが発生しました')).toBeInTheDocument()

    // 正常なレスポンスを返すハンドラーに戻す
    server.use(
      http.get('https://api.example.com/articles', () => {
        return HttpResponse.json([])
      })
    )

    // 再試行ボタンをクリック
    const retryButton = screen.getByRole('button', { name: '再試行' })
    await user.click(retryButton)

    // エラーが解消されることを確認
    await waitFor(() => {
      expect(screen.queryByText('記事の読み込みに失敗しました')).not.toBeInTheDocument()
    })
  })

  it('記事が0件の場合の表示', async () => {
    // 空の配列を返すハンドラーに置き換え
    server.use(
      http.get('https://api.example.com/articles', () => {
        return HttpResponse.json([])
      })
    )

    render(<ArticleList />)

    await waitFor(() => {
      expect(screen.getByText('記事が見つかりません')).toBeInTheDocument()
    })

    expect(screen.getByText('現在表示できる記事がありません。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '再読み込み' })).toBeInTheDocument()
  })

  it('更新ボタンをクリックすると記事を再取得する', async () => {
    const user = userEvent.setup()
    render(<ArticleList />)

    // 初回データ読み込み完了まで待機
    await waitFor(() => {
      expect(screen.getByText('記事一覧 (2件)')).toBeInTheDocument()
    })

    // 異なるデータを返すハンドラーに置き換え
    server.use(
      http.get('https://api.example.com/articles', () => {
        return HttpResponse.json([
          {
            id: '3',
            title: '更新されたテスト記事',
            category: 'テスト',
            description: '更新後の記事です',
            imageUrl: 'https://example.com/image.jpg',
            href: '/articles/updated',
            publishedAt: '2024-01-20T10:00:00Z',
            author: {
              name: '更新者',
              avatar: 'https://example.com/avatar.jpg',
            },
          },
        ])
      })
    )

    // 更新ボタンをクリック
    const updateButton = screen.getByRole('button', { name: '更新' })
    await user.click(updateButton)

    // 更新されたデータが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('記事一覧 (1件)')).toBeInTheDocument()
    })

    expect(screen.getByText('更新されたテスト記事')).toBeInTheDocument()
    expect(screen.queryByText('React Testing Libraryの使い方')).not.toBeInTheDocument()
  })

  it('記事カードのリンクが正しく設定される', async () => {
    render(<ArticleList />)

    await waitFor(() => {
      expect(screen.getByText('記事一覧 (2件)')).toBeInTheDocument()
    })

    // 記事のリンクが正しく設定されていることを確認
    const articleLinks = screen.getAllByRole('link')
    expect(articleLinks[0]).toHaveAttribute('href', '/articles/react-testing-library')
    expect(articleLinks[1]).toHaveAttribute('href', '/articles/typescript-type-safety')
  })
})
