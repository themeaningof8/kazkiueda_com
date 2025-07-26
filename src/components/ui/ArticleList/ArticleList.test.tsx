import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { server } from '@/mocks/server'

import { ArticleList } from './ArticleList'

describe('ArticleList', () => {
  beforeEach(() => {
    server.resetHandlers()

    // デフォルトで1つの公開記事をモック
    server.use(
      http.get('/articles/2024-06-01-hello-world.md', () => {
        return HttpResponse.text(`---
title: "React Testing Libraryの使い方"
description: "React Testing Libraryを使った効果的なテストの書き方について解説します。"
category: "テクノロジー"
publishedAt: "2024-01-15T10:00:00Z"
published: true
imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"
author:
  name: "田中太郎"
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
---

# React Testing Libraryの使い方

React Testing Libraryは、Reactコンポーネントをユーザーの視点でテストするためのライブラリです...`)
      }),
      http.get('/articles/2024-01-20-nextjs-draft.md', () => {
        return HttpResponse.text(`---
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

この部分は現在執筆中です...`)
      })
    )
  })

  it('記事一覧を正常に表示する', async () => {
    render(<ArticleList />)

    // ローディング状態の確認
    expect(screen.getByRole('status', { name: '読み込み中' })).toBeInTheDocument()

    // データ読み込み完了まで待機
    await waitFor(() => {
      expect(screen.getByText('記事一覧 (1件)')).toBeInTheDocument()
    })

    // 記事が表示されることを確認
    expect(screen.getByText('React Testing Libraryの使い方')).toBeInTheDocument()
    expect(screen.getByText('テクノロジー')).toBeInTheDocument()
  })

  it('ローディング状態を正しく表示する', () => {
    // 遅延レスポンスのハンドラーに置き換え
    server.use(
      http.get('/articles/2024-06-01-hello-world.md', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return new HttpResponse(null, { status: 404 })
      }),
      http.get('/articles/2024-01-20-nextjs-draft.md', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return new HttpResponse(null, { status: 404 })
      })
    )

    render(<ArticleList />)

    // ローディング状態の確認
    expect(screen.getByRole('status', { name: '読み込み中' })).toBeInTheDocument()
  })

  it('エラー状態を正しく表示し、再試行ボタンが機能する', async () => {
    // エラーレスポンスを返すハンドラーに置き換え
    server.use(
      http.get('/articles/2024-06-01-hello-world.md', () => {
        return new HttpResponse(null, { status: 404 })
      }),
      http.get('/articles/2024-01-20-nextjs-draft.md', () => {
        return new HttpResponse(null, { status: 404 })
      })
    )

    const user = userEvent.setup()
    render(<ArticleList />)

    // エラーメッセージの表示を待機（h3要素を指定）
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '記事一覧の取得に失敗しました' })).toBeInTheDocument()
    })

    // 正常なレスポンスを返すハンドラーに戻す
    server.use(
      http.get('/articles/2024-06-01-hello-world.md', () => {
        return HttpResponse.text(`---
title: "React Testing Libraryの使い方"
description: "React Testing Libraryを使った効果的なテストの書き方について解説します。"
category: "テクノロジー"
publishedAt: "2024-01-15T10:00:00Z"
published: true
imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"
author:
  name: "田中太郎"
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
---

# React Testing Libraryの使い方

React Testing Libraryは、Reactコンポーネントをユーザーの視点でテストするためのライブラリです...`)
      }),
      http.get('/articles/2024-01-20-nextjs-draft.md', () => {
        return new HttpResponse(null, { status: 404 })
      })
    )

    // 再試行ボタンをクリック
    const retryButton = screen.getByRole('button', { name: '再試行' })
    await user.click(retryButton)

    // エラーが解消され、記事が表示されることを確認
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: '記事一覧の取得に失敗しました' })).not.toBeInTheDocument()
    })

    // 1件の記事が表示されることを確認
    expect(screen.getByText('記事一覧 (1件)')).toBeInTheDocument()
    expect(screen.getByText('React Testing Libraryの使い方')).toBeInTheDocument()
  })

  it('記事が0件の場合の表示', async () => {
    // 全記事を404で返すハンドラーに置き換え
    server.use(
      http.get('/articles/2024-06-01-hello-world.md', () => {
        return new HttpResponse(null, { status: 404 })
      }),
      http.get('/articles/2024-01-20-nextjs-draft.md', () => {
        return new HttpResponse(null, { status: 404 })
      })
    )

    render(<ArticleList />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '記事一覧の取得に失敗しました' })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: '再試行' })).toBeInTheDocument()
  })

  it('更新ボタンをクリックすると記事を再取得する', async () => {
    const user = userEvent.setup()
    render(<ArticleList />)

    // 初回データ読み込み完了まで待機
    await waitFor(() => {
      expect(screen.getByText('記事一覧 (1件)')).toBeInTheDocument()
    })

    // 異なるデータを返すハンドラーに置き換え
    server.use(
      http.get('/articles/2024-06-01-hello-world.md', () => {
        return HttpResponse.text(`---
title: "更新されたテスト記事"
description: "更新後の記事です"
category: "テスト"
publishedAt: "2024-01-20T10:00:00Z"
published: true
imageUrl: "https://example.com/image.jpg"
author:
  name: "更新者"
  avatar: "https://example.com/avatar.jpg"
---

# 更新されたテスト記事

更新後の記事です`)
      }),
      http.get('/articles/2024-01-20-nextjs-draft.md', () => {
        return new HttpResponse(null, { status: 404 })
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
      expect(screen.getByText('記事一覧 (1件)')).toBeInTheDocument()
    })

    // 記事のリンクが正しく設定されていることを確認（短縮バージョン）
    const articleLinks = screen.getAllByRole('link')
    expect(articleLinks[0]).toHaveAttribute('href', '/articles/hello-world')
  })
})
